export default function ActivityLog({ logs }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 20, padding: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'emussPulse 1.6s ease-in-out infinite' }} />
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>Registro de actividad en tiempo real</span>
      </div>
      <div style={{ display: 'grid', gap: 8, maxHeight: 260, overflow: 'auto' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, fontSize: 13, fontFamily: 'monospace', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
            <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{log.time}</span>
            <span>{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
