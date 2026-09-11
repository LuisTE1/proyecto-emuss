import { supabase } from './supabaseClient';

// Envía el correo de confirmación vía la Edge Function `send-reservation-email`.
// No lanza si el proveedor de correo (Resend) todavía no está configurado —
// la reserva nunca debe fallar por esto, ver supabase/functions/send-reservation-email.
export async function sendReservationEmail({ to, sedeName, dateLabel, slotTime, code, nombre }) {
  if (!to) return { sent: false, reason: 'no_email' };

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#4f46e5;">¡Reserva confirmada, ${nombre}!</h2>
      <p>Tu carril está separado. Aquí el resumen:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#64748b;">Sede</td><td style="padding:6px 0;text-align:right;"><strong>${sedeName}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Fecha</td><td style="padding:6px 0;text-align:right;"><strong>${dateLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Horario</td><td style="padding:6px 0;text-align:right;"><strong>${slotTime}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Código</td><td style="padding:6px 0;text-align:right;"><strong>${code}</strong></td></tr>
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">EMUSS — Red de complejos acuáticos.</p>
    </div>
  `;

  try {
    const { data, error } = await supabase.functions.invoke('send-reservation-email', {
      body: { to, subject: `Reserva confirmada — ${code}`, html },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('No se pudo enviar el correo de confirmación:', err);
    return { sent: false, reason: 'invoke_failed' };
  }
}

export async function requestNotifyOnFreeSlot({ sedeId, sedeName, time, day, contact }) {
  const { error } = await supabase.from('notify_requests').insert({ sede_id: sedeId, sede_name: sedeName, time, day, contact });
  if (error) throw error;
}
