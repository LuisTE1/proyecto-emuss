import Modal from '../../../components/ui/Modal';
import { dayLabel } from '../../../utils/dateUtils';

// Se abre desde el QR del ticket (`?verificar=TOKEN`) — sin sesión. Pensada
// para que el celular del encargado de la puerta la abra directo al
// escanear y vea de un vistazo si la reserva es válida.
export default function PublicVerifyModal({ modal, onClose }) {
  const { status, data } = modal;

  if (status === 'loading') {
    return (
      <Modal maxWidth={380} textAlign="center">
        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600, padding: '20px 0' }}>Verificando…</div>
      </Modal>
    );
  }

  const isValid = data?.found && data?.estado === 'confirmada';
  const isCancelled = data?.found && data?.estado === 'cancelada';

  return (
    <Modal maxWidth={380} textAlign="center">
      <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 14 }}>{isValid ? '✅' : '❌'}</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: isValid ? '#15803d' : '#e11d48', marginBottom: 10 }}>
        {!data?.found ? 'No válido' : isCancelled ? 'Reserva cancelada' : isValid ? 'Reserva válida' : 'No válido'}
      </div>
      {data?.found ? (
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 18, textAlign: 'left', display: 'grid', gap: 8, fontSize: 14, color: '#334155', marginBottom: 8 }}>
          <div><span style={{ color: '#94a3b8' }}>Nombre: </span><strong>{data.nombre}</strong></div>
          <div><span style={{ color: '#94a3b8' }}>Sede: </span><strong>{data.sedeName}</strong></div>
          <div><span style={{ color: '#94a3b8' }}>Fecha: </span><strong>{dayLabel(data.fecha)}</strong></div>
          <div><span style={{ color: '#94a3b8' }}>Horario: </span><strong>{data.time}</strong></div>
          {isValid && (
            <div><span style={{ color: '#94a3b8' }}>Check-in: </span><strong>{data.checkedIn ? 'Ya registrado' : 'Pendiente'}</strong></div>
          )}
        </div>
      ) : (
        <p style={{ color: '#64748b', fontSize: 13.5, marginBottom: 8 }}>Este código no corresponde a ninguna reserva.</p>
      )}
      <button onClick={onClose} style={{ width: '100%', marginTop: 16, padding: 13, borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cerrar</button>
    </Modal>
  );
}
