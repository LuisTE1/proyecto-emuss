// MAQUETA VISUAL — notificaciones de ejemplo; en producción las dispara
// notificationsService según el canal preferido y el patrón detectado.
const CHANNEL_BADGE = {
  push: { icon: '🔔', label: 'Push', color: '#4f46e5' },
  email: { icon: '📧', label: 'Correo', color: '#0369a1' },
  whatsapp: { icon: '💬', label: 'WhatsApp', color: '#15803d' },
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1, channel: 'push', time: 'Hace 12 min', unread: true,
    title: '¡Cupo liberado en tu sede habitual!',
    text: 'Sede Chacarilla, martes 07:00 - 08:00 acaba de liberarse. Resérvalo antes que otro.',
    cta: 'Reservar ahora',
  },
  {
    id: 2, channel: 'email', time: 'Ayer, 18:42', unread: true,
    title: 'Tu horario habitual ya está reservado',
    text: 'Sede Chacarilla, martes 07:00 está lleno. Sede Montjoy tiene cupo a la misma hora, a 18 min de distancia.',
    cta: 'Ver Sede Montjoy',
  },
  {
    id: 3, channel: 'whatsapp', time: 'Lun 07 Set, 09:03', unread: false,
    title: 'Recordatorio de reserva',
    text: 'Tu reserva en Sede Ferrero es mañana a las 19:00. Responde CANCELAR si no podrás asistir.',
    cta: null,
  },
  {
    id: 4, channel: 'push', time: 'Vie 04 Set, 07:31', unread: false,
    title: 'Nuevo cupo cerca de ti',
    text: 'Sede Ferrero abrió un carril extra hoy 12:00 - 13:00 por baja demanda.',
    cta: 'Ver disponibilidad',
  },
];

export default function NotificationsFeed({ items = MOCK_NOTIFICATIONS }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a' }}>Notificaciones</div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '4px 10px', borderRadius: 999 }}>
          {items.filter((n) => n.unread).length} nuevas
        </span>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((n) => {
          const badge = CHANNEL_BADGE[n.channel];
          return (
            <div
              key={n.id}
              style={{
                display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14,
                background: n.unread ? '#f8fafc' : '#ffffff',
                border: `1px solid ${n.unread ? '#e2e8f0' : '#f1f5f9'}`,
              }}
            >
              <div
                style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, background: '#eef2ff',
                }}
                title={badge.label}
              >
                {badge.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 13.5, color: '#0f172a' }}>{n.title}</strong>
                  <span style={{ fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>{n.time}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{n.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: badge.color }}>Enviado por {badge.label}</span>
                  {n.cta && (
                    <button style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 11.5, cursor: 'pointer' }}>
                      {n.cta}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
