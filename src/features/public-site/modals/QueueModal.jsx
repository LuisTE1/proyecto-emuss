import Modal from '../../../components/ui/Modal';

export default function QueueModal({ step, sedeName, slotTime, onClose, onJoinQueue }) {
  return (
    <Modal>
      {step === 'info' && (
        <>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.01em' }}>
            Cola Virtual — {sedeName}
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 15, color: '#475569' }}>Horario seleccionado: <strong>{slotTime}</strong></p>
          <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: 16, padding: '16px 18px', fontSize: 14, fontWeight: 600, color: '#075985', marginBottom: 20 }}>
            ⏳ Hay 2 personas en espera de liberación por tiempo.
          </div>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748b', lineHeight: 1.55 }}>
            Este carril está en ventana de 3 minutos. Si el comprador actual no finaliza su compra, se liberará automáticamente.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={onJoinQueue} style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.28)' }}>Unirme a la lista</button>
          </div>
        </>
      )}
      {step === 'success' && (
        <>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#4f46e5', marginBottom: 16, letterSpacing: '-0.01em' }}>Registrado en la cola</div>
          <div style={{ background: '#f8fafc', borderRadius: 18, padding: 24, marginBottom: 20, border: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 800, fontSize: 30, color: '#0f172a', letterSpacing: '-0.02em' }}>Puesto #3</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>de la cola para {sedeName} · {slotTime}</div>
          </div>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569', lineHeight: 1.55 }}>
            Recibirás una alerta push/SMS si el comprador actual no finaliza su transacción dentro de su ventana de 3 minutos.
          </p>
          <button onClick={onClose} style={{ width: '100%', padding: 15, borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.28)' }}>Entendido</button>
        </>
      )}
    </Modal>
  );
}
