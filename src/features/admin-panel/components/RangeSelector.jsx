export default function RangeSelector({ options }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 999, padding: 5 }}>
        {options.map((ro) => (
          <button
            key={ro.key}
            onClick={ro.onClick}
            style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              background: ro.active ? '#4f46e5' : 'transparent', color: ro.active ? '#ffffff' : '#334155',
            }}
          >
            {ro.label}
          </button>
        ))}
      </div>
    </div>
  );
}
