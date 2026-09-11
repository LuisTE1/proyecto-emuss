export default function SedeBarChart({ bars }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Reservas por sede</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 160 }}>
        {bars.map((b) => (
          <div key={b.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{b.count}</span>
            <div style={{ width: 38, height: b.heightPx, background: '#4f46e5', borderRadius: '8px 8px 0 0' }} />
            <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textAlign: 'center' }}>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
