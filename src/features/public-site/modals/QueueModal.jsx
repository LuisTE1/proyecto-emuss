import Modal from '../../../components/ui/Modal';

export default function QueueModal({ sedeName, slotTime, waitingCount, countdownLabel, onClose, onJoinQueue }) {
  const hasCountdown = Boolean(countdownLabel) && countdownLabel !== '00:00';

  return (
    <Modal>
      <div style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.01em' }}>
        Este horario está en proceso — {sedeName}
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 15, color: '#475569' }}>Horario seleccionado: <strong>{slotTime}</strong></p>
      <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: 16, padding: '16px 18px', fontSize: 14, fontWeight: 600, color: '#075985', marginBottom: 20 }}>
        ⏳ {waitingCount === 1
          ? 'Hay 1 persona completando su reserva ahora mismo.'
          : `Hay ${waitingCount} personas completando su reserva ahora mismo.`}
      </div>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748b', lineHeight: 1.55 }}>
        {hasCountdown
          ? <>Si no termina de pagar, el cupo se libera en <strong style={{ color: '#0f172a' }}>{countdownLabel}</strong>.</>
          : 'El cupo podría liberarse en cualquier momento si la persona no termina de pagar.'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
        <button onClick={onJoinQueue} style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.28)' }}>Avisarme si se libera</button>
      </div>
    </Modal>
  );
}
