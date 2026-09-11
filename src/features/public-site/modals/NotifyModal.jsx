import Modal from '../../../components/ui/Modal';

export default function NotifyModal({ confirmed, sedeName, slotTime, contact, onChangeContact, onClose, onSubmit }) {
  return (
    <Modal maxWidth={420}>
      {confirmed ? (
        <>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔔</div>
          <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 10 }}>¡Listo!</div>
          <p style={{ margin: '0 0 24px', fontSize: 14.5, color: '#475569', lineHeight: 1.55 }}>
            Te avisaremos apenas se libere un cupo en {sedeName}, {slotTime}.
          </p>
          <button onClick={onClose} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>Entendido</button>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 6 }}>Avisarme si se libera un cupo</div>
          <p style={{ margin: '0 0 18px', fontSize: 13.5, color: '#64748b' }}>{sedeName} · {slotTime}</p>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Correo o teléfono</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => onChangeContact(e.target.value)}
            placeholder="tu@correo.com o 9********"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, marginBottom: 20 }}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '13px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={onSubmit} style={{ padding: '13px 20px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Avisarme</button>
          </div>
        </>
      )}
    </Modal>
  );
}
