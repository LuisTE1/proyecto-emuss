import { STATUS_STYLE } from '../../../services/sedesService';

export default function SlotButton({ slot }) {
  const st = STATUS_STYLE[slot.status];
  const isReservado = slot.status === 'reservado';
  const isPasado = slot.status === 'pasado';
  const isDisabled = isReservado || isPasado;

  const style = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    width: '100%', textAlign: 'left', padding: '13px 16px', fontSize: 13.5, fontFamily: 'inherit',
    borderRadius: 14, border: `1px solid ${st.border}`, background: st.bg, color: st.color, fontWeight: 500,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.7 : 1,
    animation: slot.status === 'enreserva' ? 'emussPulse 2.2s ease-in-out infinite' : 'none',
    transition: 'transform 0.15s ease',
  };

  const button = (
    <button onClick={slot.onClick} disabled={isDisabled} style={style}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{st.icon}</span>{slot.time}
      </span>
      <span style={{ fontWeight: 700, fontSize: 11.5 }}>{slot.label}</span>
    </button>
  );

  if (isPasado) return button;
  if (!isReservado) return button;

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
      {button}
      <button
        onClick={slot.onNotify}
        title="Avisarme si se libera un cupo"
        style={{ flex: '0 0 auto', width: 42, borderRadius: 14, border: '1px solid #fbcfe0', background: '#fdf2f4', cursor: 'pointer', fontSize: 15 }}
      >
        🔔
      </button>
    </div>
  );
}
