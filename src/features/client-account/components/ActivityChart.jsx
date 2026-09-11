export default function ActivityChart({ weeks }) {
  const max = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Tu actividad este mes</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 120 }}>
        {weeks.map((w) => (
          <div key={w.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{w.count}</span>
            <div style={{ width: 34, height: Math.max(6, Math.round((w.count / max) * 80)), background: '#818cf8', borderRadius: '8px 8px 0 0' }} />
            <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
