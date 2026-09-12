import { supabase } from './supabaseClient';
import { paymentMethodLabel } from '../features/public-site/publicSiteSelectors';

// TODO: reemplazar por el número real de EMUSS (con código de país, sin
// espacios ni "+") apenas lo tengan — este es un valor de ejemplo.
export const WHATSAPP_NUMBER = '51900000000';

export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// URL base del sitio publicado (funciona tanto en localhost como en el
// subdirectorio de GitHub Pages), para armar el enlace de cancelación que
// va en el correo.
function siteBaseUrl() {
  const base = import.meta.env.BASE_URL || '/';
  return `${window.location.origin}${base}`.replace(/\/?$/, '/');
}

export function cancelUrlFor(code) {
  return `${siteBaseUrl()}?cancelar=${encodeURIComponent(code)}`;
}

// URL que codifica el QR del ticket: la abre el celular del encargado de la
// puerta al escanear (sin instalar nada) y muestra si la reserva es válida.
export function verifyUrlFor(code) {
  return `${siteBaseUrl()}?verificar=${encodeURIComponent(code)}`;
}

async function invokeEmail(to, subject, html) {
  if (!to) return { sent: false, reason: 'no_email' };
  try {
    const { data, error } = await supabase.functions.invoke('send-reservation-email', { body: { to, subject, html } });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('No se pudo enviar el correo:', err);
    return { sent: false, reason: 'invoke_failed' };
  }
}

function emailShell(bodyHtml) {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;padding:24px 0;">
      <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
        <div style="background:linear-gradient(100deg,#0f172a 0%,#312e81 50%,#4338ca 100%);padding:28px 32px;">
          <div style="color:#ffffff;font-weight:800;font-size:20px;letter-spacing:-0.02em;">EMUSS</div>
          <div style="color:#c7d2fe;font-size:12.5px;margin-top:2px;">Red de complejos acuáticos — Surco</div>
        </div>
        <div style="padding:28px 32px;">
          ${bodyHtml}
        </div>
        <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:11.5px;">
          Este correo fue generado automáticamente por EMUSS. Si tienes dudas, escríbenos por WhatsApp o a contacto@emuss.pe.
        </div>
      </div>
    </div>
  `;
}

function infoRow(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:7px 0;color:#64748b;font-size:13.5px;">${label}</td><td style="padding:7px 0;text-align:right;font-size:13.5px;"><strong style="color:#0f172a;">${value}</strong></td></tr>`;
}

// Correo de confirmación con TODA la información de la reserva (no solo
// sede/fecha/hora), más el enlace para cancelar (funciona con o sin
// sesión — ver cancel_reservation_public) y un botón de WhatsApp para
// coordinar devoluciones o reprogramaciones.
export async function sendReservationEmail(reservation) {
  const {
    to, nombre, sedeName, dateLabel, slotTime, code, personas, acompanantes = [],
    metodoPago, precio, exclusivo, notasAccesibilidad, accesibilidadLabel,
  } = reservation;

  const cancelUrl = cancelUrlFor(code);
  const waMessage = `Hola EMUSS, tengo una consulta sobre mi reserva ${code}.`;

  const html = emailShell(`
    <h2 style="color:#0f172a;font-size:20px;margin:0 0 6px;">¡Reserva confirmada, ${nombre}!</h2>
    <p style="color:#64748b;font-size:13.5px;margin:0 0 20px;">Tu carril está separado. Aquí el resumen completo:</p>
    <table style="width:100%;border-collapse:collapse;">
      ${infoRow('Código', code)}
      ${infoRow('Sede', sedeName)}
      ${infoRow('Fecha', dateLabel)}
      ${infoRow('Horario', slotTime)}
      ${infoRow('Personas', exclusivo ? 'Carril exclusivo' : personas)}
      ${acompanantes.length ? infoRow('Acompañantes', acompanantes.join(', ')) : ''}
      ${infoRow('Método de pago', paymentMethodLabel(metodoPago))}
      ${infoRow('Monto', `S/${precio}`)}
      ${accesibilidadLabel ? infoRow('Accesibilidad', accesibilidadLabel) : ''}
      ${notasAccesibilidad ? infoRow('Notas', notasAccesibilidad) : ''}
    </table>
    <div style="margin-top:24px;display:flex;gap:10px;flex-wrap:wrap;">
      <a href="${cancelUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#fff1f2;color:#e11d48;font-weight:700;font-size:13px;text-decoration:none;border:1.5px solid #fecdd3;">❌ Cancelar esta reserva</a>
      <a href="${whatsappUrl(waMessage)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#f0fdf4;color:#15803d;font-weight:700;font-size:13px;text-decoration:none;border:1.5px solid #bbf7d0;">💬 Escribir por WhatsApp</a>
    </div>
    <p style="color:#94a3b8;font-size:11.5px;margin-top:20px;">Si cancelas, te pediremos tu DNI o correo para confirmar que la reserva es tuya.</p>
  `);

  return invokeEmail(to, `Reserva confirmada — ${code}`, html);
}

// Correo de aviso cuando el admin cancela una reserva (o cuando la persona
// misma la cancela desde el enlace) — deja claro que el cupo quedó libre y
// ofrece WhatsApp para coordinar devolución o reprogramación.
export async function sendCancellationEmail({ to, nombre, sedeName, dateLabel, slotTime, code }) {
  const waMessage = `Hola EMUSS, cancelé mi reserva ${code} y quisiera coordinar la devolución o reprogramarla.`;
  const html = emailShell(`
    <h2 style="color:#0f172a;font-size:20px;margin:0 0 6px;">Reserva cancelada</h2>
    <p style="color:#64748b;font-size:13.5px;margin:0 0 20px;">Hola ${nombre}, tu reserva quedó cancelada y el cupo fue liberado.</p>
    <table style="width:100%;border-collapse:collapse;">
      ${infoRow('Código', code)}
      ${infoRow('Sede', sedeName)}
      ${infoRow('Fecha', dateLabel)}
      ${infoRow('Horario', slotTime)}
    </table>
    <div style="margin-top:24px;">
      <a href="${whatsappUrl(waMessage)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#f0fdf4;color:#15803d;font-weight:700;font-size:13px;text-decoration:none;border:1.5px solid #bbf7d0;">💬 Coordinar devolución por WhatsApp</a>
    </div>
  `);
  return invokeEmail(to, `Reserva cancelada — ${code}`, html);
}

// Aviso de incidente: se manda a quienes tenían reserva confirmada
// justo en el horario/sede afectado, desde el panel de Emergencia.
export async function sendIncidentEmail({ to, nombre, sedeName, dateLabel, slotTime, code, motivo }) {
  const waMessage = `Hola EMUSS, recibí el aviso de incidente sobre mi reserva ${code}.`;
  const html = emailShell(`
    <h2 style="color:#b91c1c;font-size:20px;margin:0 0 6px;">⚠️ Aviso importante sobre tu reserva</h2>
    <p style="color:#64748b;font-size:13.5px;margin:0 0 16px;">
      Hola ${nombre}, ocurrió un incidente que afecta tu reserva en <strong>${sedeName}</strong>.
      ${motivo ? `Motivo: ${motivo}.` : ''}
    </p>
    <table style="width:100%;border-collapse:collapse;">
      ${infoRow('Código', code)}
      ${infoRow('Sede', sedeName)}
      ${infoRow('Fecha', dateLabel)}
      ${infoRow('Horario', slotTime)}
    </table>
    <div style="margin-top:24px;">
      <a href="${whatsappUrl(waMessage)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#f0fdf4;color:#15803d;font-weight:700;font-size:13px;text-decoration:none;border:1.5px solid #bbf7d0;">💬 Coordinar por WhatsApp (devolución o reprogramación)</a>
    </div>
  `);
  return invokeEmail(to, `Aviso importante — reserva ${code}`, html);
}

export async function requestNotifyOnFreeSlot({ sedeId, sedeName, time, fecha, contact }) {
  const { error } = await supabase.from('notify_requests').insert({ sede_id: sedeId, sede_name: sedeName, time, fecha, contact });
  if (error) throw error;
}
