export default function FilterBar({ filters }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={f.onClick}
          style={{
            padding: '12px 22px', fontSize: 14, fontWeight: 700, borderRadius: 999,
            border: f.active ? 'none' : '1px solid #e2e8f0',
            background: f.active ? '#4f46e5' : '#ffffff',
            color: f.active ? '#ffffff' : '#334155',
            boxShadow: f.active ? '0 8px 18px rgba(79,70,229,0.28)' : 'none',
            cursor: 'pointer',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
