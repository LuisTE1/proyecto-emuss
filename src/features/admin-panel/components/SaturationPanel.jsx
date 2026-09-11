export default function SaturationPanel({ saturation }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Saturación por sede (hoy)</div>
      <div style={{ display: 'grid', gap: 18 }}>
        {saturation.map((row) => (
          <div key={row.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              <span>{row.name}</span>
              <span style={{ color: row.color, fontWeight: 800 }}>{row.pct}%</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 999, height: 10, overflow: 'hidden' }}>
              <div style={{ width: `${row.pct}%`, height: '100%', borderRadius: 999, background: row.color, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
