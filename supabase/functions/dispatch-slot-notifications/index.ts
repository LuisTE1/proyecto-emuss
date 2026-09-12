// Edge Function: dispatch-slot-notifications
//
// La llama el job de pg_cron `dispatch-slot-notifications` (cada minuto,
// ver migración `enable_pg_cron_and_notify_dispatch`) por cada solicitud de
// "avisarme si se libera un cupo" (`notify_requests`) cuyo horario ya tiene
// espacio libre. Envía el correo con el enlace que lleva directo al
// formulario de esa reserva (`?reservar=...&reservarFecha=...&reservarHora=...`).
//
// Usa el mismo proveedor (Resend) y el mismo secreto que
// send-reservation-email — si RESEND_API_KEY no está configurada, no falla,
// solo no envía nada (igual que el resto de correos de esta app).

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('NOTIFICATIONS_FROM_EMAIL') ?? 'EMUSS <onboarding@resend.dev>';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://luiste1.github.io/proyecto-emuss/';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function emailShell(bodyHtml: string) {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;padding:24px 0;">
      <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
        <div style="background:linear-gradient(100deg,#0f172a 0%,#312e81 50%,#4338ca 100%);padding:28px 32px;">
          <div style="color:#ffffff;font-weight:800;font-size:20px;letter-spacing:-0.02em;">EMUSS</div>
          <div style="color:#c7d2fe;font-size:12.5px;margin-top:2px;">Red de complejos acuáticos — Surco</div>
        </div>
        <div style="padding:28px 32px;">${bodyHtml}</div>
        <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:11.5px;">
          Este correo fue generado automáticamente por EMUSS.
        </div>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sedeId, sedeName, time, fecha, contact } = await req.json();

    if (!contact || !contact.includes('@')) {
      // Por ahora solo se manda correo — si guardaron un teléfono, todavía
      // no hay proveedor de SMS conectado para avisarles.
      return new Response(JSON.stringify({ sent: false, reason: 'no_email_contact' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({ reservar: sedeId, reservarFecha: fecha, reservarHora: time });
    const link = `${SITE_URL}?${params.toString()}`;

    const html = emailShell(`
      <h2 style="color:#0f172a;font-size:20px;margin:0 0 6px;">¡Se liberó un cupo!</h2>
      <p style="color:#64748b;font-size:13.5px;margin:0 0 20px;">
        En <strong>${sedeName}</strong>, horario <strong>${time}</strong> (${fecha}), justo se liberó un carril.
        Aprovecha antes que alguien más lo tome.
      </p>
      <div style="margin-top:8px;">
        <a href="${link}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:#4f46e5;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">Reservar ahora →</a>
      </div>
    `);

    if (!RESEND_API_KEY) {
      console.log(`[dispatch-slot-notifications] RESEND_API_KEY no configurada — correo simulado para ${contact}`);
      return new Response(JSON.stringify({ sent: false, reason: 'email_provider_not_configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: contact, subject: `¡Se liberó un cupo en ${sedeName}!`, html }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error('[dispatch-slot-notifications] Resend error:', detail);
      return new Response(JSON.stringify({ sent: false, reason: 'provider_error', detail }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[dispatch-slot-notifications] Error inesperado:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
