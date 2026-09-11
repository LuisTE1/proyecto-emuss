function tabStyle(active) {
  return {
    padding: '10px 18px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    background: active ? '#4f46e5' : '#ffffff', color: active ? '#ffffff' : '#334155',
    boxShadow: active ? '0 6px 16px rgba(79,70,229,0.25)' : 'none',
  };
}

export default function AccountTabs({ activeTab, onChange, unreadCount = 0 }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
      <button onClick={() => onChange('resumen')} style={tabStyle(activeTab === 'resumen')}>📊 Resumen</button>
      <button onClick={() => onChange('notificaciones')} style={{ ...tabStyle(activeTab === 'notificaciones'), display: 'flex', alignItems: 'center', gap: 8 }}>
        🔔 Notificaciones
        {unreadCount > 0 && (
          <span style={{ background: activeTab === 'notificaciones' ? 'rgba(255,255,255,0.25)' : '#eef2ff', color: activeTab === 'notificaciones' ? '#ffffff' : '#4f46e5', fontSize: 11, fontWeight: 800, borderRadius: 999, padding: '1px 7px' }}>
            {unreadCount}
          </span>
        )}
      </button>
      <button onClick={() => onChange('reservas')} style={tabStyle(activeTab === 'reservas')}>🎫 Mis reservas</button>
    </div>
  );
}
