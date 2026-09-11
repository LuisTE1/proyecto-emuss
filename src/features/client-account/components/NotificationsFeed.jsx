export default function NotificationsFeed({ items }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a' }}>Notificaciones</div>
      </div>

      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13.5, color: '#64748b' }}>
          Todavía no tienes notificaciones. Aquí verás avisos cuando confirmes o canceles una reserva.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((n) => (
            <div
              key={n.id}
              style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div
                style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, background: n.cancelled ? '#fdf2f4' : '#eef2ff',
                }}
              >
                {n.cancelled ? '🚫' : '✅'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 13.5, color: '#0f172a' }}>{n.title}</strong>
                  <span style={{ fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>{n.time}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{n.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
