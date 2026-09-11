// Edge Function: send-reservation-email
//
// Envía el correo de confirmación de una reserva (o, más adelante, los
// avisos de "cupo liberado" / "tu horario habitual ya está reservado").
//
// Por ahora queda PREPARADA pero sin proveedor de correo conectado: si no
// hay RESEND_API_KEY configurada, responde 200 con `sent: false` en vez de
// fallar, para que el resto de la app (confirmar reserva, etc.) nunca se
// rompa por esto. Para activarla de verdad:
//   1) Crea una cuenta gratis en https://resend.com y verifica un dominio
//      (o usa el dominio de pruebas que te dan).
//   2) supabase secrets set RESEND_API_KEY=re_xxx --project-ref TU-PROYECTO
//   3) supabase functions deploy send-reservation-email
//
// Se invoca desde el frontend con:
//   supabase.functions.invoke('send-reservation-email', { body: { to, subject, html } })

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('NOTIFICATIONS_FROM_EMAIL') ?? 'EMUSS <onboarding@resend.dev>';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Faltan campos: to, subject, html' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!RESEND_API_KEY) {
      console.log(`[send-reservation-email] RESEND_API_KEY no configurada — correo simulado para ${to}: ${subject}`);
      return new Response(JSON.stringify({ sent: false, reason: 'email_provider_not_configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error('[send-reservation-email] Resend error:', detail);
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
    console.error('[send-reservation-email] Error inesperado:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
