export default function FranjaChart({ bars }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)', marginBottom: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Ocupación por franja horaria</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, overflowX: 'auto' }}>
        {bars.map((fb) => (
          <div key={fb.hour} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 44, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 700, fontSize: 11.5, color: '#0f172a' }}>{fb.count}</span>
            <div style={{ width: 30, height: fb.heightPx, background: '#818cf8', borderRadius: '8px 8px 0 0' }} />
            <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>{fb.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
