import { useState } from 'react';
import Modal from '../../../components/ui/Modal';

const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 };

// Se abre desde el enlace del correo (`?cancelar=EMUSS-1234`) — funciona
// con o sin sesión. El código por sí solo no basta (es secuencial y
// adivinable), así que pide el DNI o correo con el que se hizo esa
// reserva para confirmar que es tuya antes de cancelarla de verdad.
export default function PublicCancelModal({ modal, onSubmit, onClose }) {
  const [value, setValue] = useState('');
  const { code, status, message } = modal;

  if (status === 'success') {
    return (
      <Modal maxWidth={420} textAlign="center">
        <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 8 }}>Reserva cancelada</div>
        <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#64748b' }}>
          La reserva <strong>{code}</strong> quedó cancelada y el cupo fue liberado. Te enviamos la confirmación por correo.
        </p>
        <button onClick={onClose} style={{ width: '100%', padding: 13, borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Listo</button>
      </Modal>
    );
  }

  return (
    <Modal maxWidth={420}>
      <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 6 }}>Cancelar reserva</div>
      <p style={{ margin: '0 0 18px', fontSize: 13.5, color: '#64748b' }}>
        Vas a cancelar la reserva <strong>{code}</strong>. Para confirmar que es tuya, ingresa el DNI o el correo con el que la hiciste.
      </p>
      {message && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
          {message}
        </div>
      )}
      <input
        type="text" value={value} onChange={(e) => setValue(e.target.value)}
        placeholder="DNI o correo electrónico" style={{ ...fieldStyle, marginBottom: 20 }}
      />
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={status === 'loading'} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Cerrar
        </button>
        <button
          onClick={() => onSubmit(value)}
          disabled={status === 'loading' || !value.trim()}
          style={{
            padding: '13px 22px', borderRadius: 12, border: 'none', color: '#ffffff', fontWeight: 700, fontSize: 14,
            cursor: status === 'loading' ? 'default' : 'pointer', background: status === 'loading' ? '#fca5a5' : '#e11d48',
          }}
        >
          {status === 'loading' ? 'Cancelando…' : '❌ Cancelar reserva'}
        </button>
      </div>
    </Modal>
  );
}
