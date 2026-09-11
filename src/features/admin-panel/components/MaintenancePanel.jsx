export default function MaintenancePanel({ rows }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0f172a', marginBottom: 16 }}>Mantenimiento de sedes</div>
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((row) => (
          <div key={row.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#334155' }}>{row.name}</span>
            <button
              onClick={row.onClick}
              style={{
                padding: '7px 14px', fontSize: 12, fontWeight: 700, borderRadius: 999, cursor: 'pointer',
                border: row.on ? 'none' : '1px solid #e2e8f0',
                background: row.on ? '#fef3c7' : '#ffffff', color: row.on ? '#92400e' : '#64748b',
              }}
            >
              {row.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
