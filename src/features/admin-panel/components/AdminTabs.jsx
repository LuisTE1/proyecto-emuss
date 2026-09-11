function tabStyle(active) {
  return {
    padding: '10px 18px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    background: active ? '#4f46e5' : '#ffffff', color: active ? '#ffffff' : '#334155',
    boxShadow: active ? '0 6px 16px rgba(79,70,229,0.25)' : 'none',
  };
}

export default function AdminTabs({ activeTab, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
      <button onClick={() => onChange('analytics')} style={tabStyle(activeTab === 'analytics')}>📊 Analítica</button>
      <button onClick={() => onChange('accesos')} style={tabStyle(activeTab === 'accesos')}>🔐 Gestión de accesos</button>
    </div>
  );
}
