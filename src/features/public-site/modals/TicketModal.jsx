import Modal from '../../../components/ui/Modal';
import { paymentMethodLabel } from '../publicSiteSelectors';
import { whatsappUrl } from '../../../services/notificationsService';

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function accessibilityItems(ticket) {
  const items = [];
  if (ticket.necesitaElevador) items.push('Elevador hidráulico');
  if (ticket.necesitaRampa) items.push('Rampa / silla de ruedas');
  if (ticket.necesitaAsistencia) items.push('Apoyo auditivo o visual');
  if (ticket.vaConCuidador) items.push('Con cuidador/asistente');
  return items;
}

export default function TicketModal({ ticket, sedeName, dateLabel, slotTime, onClose, onCancelReserva }) {
  const accessibility = accessibilityItems(ticket);
  const isCancelled = ticket.estado === 'cancelada';

  return (
    <Modal maxWidth={440} scroll textAlign="center">
      <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>{isCancelled ? '🚫' : '✅'}</div>
      <div style={{ fontWeight: 800, fontSize: 22, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.01em' }}>
        {isCancelled ? 'Reserva cancelada' : '¡Reserva Confirmada!'}
      </div>
      <div style={{ background: isCancelled ? '#fff1f2' : '#eef2ff', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: isCancelled ? '#e11d48' : '#4338ca', fontWeight: 600, marginBottom: 24 }}>
        {isCancelled ? 'Esta reserva ya no está vigente — el cupo quedó liberado.' : 'Hemos enviado este ticket a tu correo electrónico.'}
      </div>
      <div style={{ border: `2px dashed ${isCancelled ? '#fecdd3' : '#c7d2fe'}`, borderRadius: 18, padding: 22, textAlign: 'left', background: '#fafaff', marginBottom: 20, opacity: isCancelled ? 0.85 : 1 }}>
        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: '#334155' }}>
          <Row label="Nombre" value={ticket.nombre} />
          <Row label="DNI" value={ticket.dni} />
          <Row label="Sede" value={sedeName} />
          <Row label="Fecha" value={dateLabel} />
          <Row label="Horario" value={slotTime} />
          <Row label="Personas" value={ticket.exclusivo ? 'Carril exclusivo' : ticket.personas} />
          {!ticket.exclusivo && (ticket.acompanantes || []).length > 0 && (
            <Row label="Acompañantes" value={ticket.acompanantes.join(', ')} />
          )}
          <Row label="Método de pago" value={paymentMethodLabel(ticket.metodoPago)} />
          {ticket.contactoEmergencia && <Row label="Contacto de emergencia" value={ticket.contactoEmergencia} />}
          <Row label="Estado" value={isCancelled ? 'Cancelada' : 'Confirmada'} />
          <div style={{ borderTop: '1px dashed #c7d2fe', marginTop: 6, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8' }}>Monto</span>
            <strong style={{ fontSize: 16, color: '#4f46e5' }}>S/{ticket.precio ?? 0}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8' }}>Código de reserva</span>
            <strong style={{ fontSize: 16, color: '#4f46e5', letterSpacing: '0.02em' }}>{ticket.code}</strong>
          </div>
        </div>
      </div>
      {accessibility.length > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', fontSize: 12.5, color: '#166534', fontWeight: 600, textAlign: 'left', marginBottom: 20 }}>
          ♿ El personal de la sede ya sabe que necesitas: {accessibility.join(', ')}.
        </div>
      )}
      <button onClick={onClose} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.28)', marginBottom: 10 }}>Listo</button>
      {!isCancelled && (
        <button onClick={onCancelReserva} style={{ width: '100%', padding: 13, borderRadius: 12, border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>❌ ¿Deseas cancelar tu reserva?</button>
      )}
      <a
        href={whatsappUrl(`Hola EMUSS, tengo una consulta sobre mi reserva ${ticket.code}${isCancelled ? ' (ya cancelada) para coordinar la devolución o reprogramarla' : ''}.`)}
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 13, borderRadius: 12, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}
      >
        💬 {isCancelled ? 'Coordinar devolución por WhatsApp' : 'Escribir por WhatsApp'}
      </a>
    </Modal>
  );
}
