export default function EmergencyPanel({ panicActive, onTogglePanic }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', borderRadius: 20, padding: 26, boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}>
      <div style={{ color: '#fecaca', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Emergencia</div>
      <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14.5, marginBottom: 16, lineHeight: 1.5 }}>
        Suspende todas las reservas nuevas en la red EMUSS de forma inmediata.
      </div>
      <button
        onClick={onTogglePanic}
        style={{
          width: '100%', padding: 13, borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 13.5, cursor: 'pointer',
          background: panicActive ? '#ffffff' : '#0f172a', color: panicActive ? '#7f1d1d' : '#ffffff',
        }}
      >
        {panicActive ? '✅ Reanudar reservas' : '🚨 Activar botón de pánico'}
      </button>
    </div>
  );
}
