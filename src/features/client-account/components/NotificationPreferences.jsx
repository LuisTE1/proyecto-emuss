import { useState } from 'react';

// Correo es el único canal realmente activo hoy (ver notificationsService /
// send-reservation-email). Push y WhatsApp se muestran pero deshabilitados
// para no prometer un aviso que todavía no se envía.
const CHANNELS = [
  { key: 'email', icon: '📧', label: 'Correo', hint: 'Te escribimos a tu correo registrado cuando confirmas una reserva.', available: true },
  { key: 'push', icon: '🔔', label: 'App (push)', hint: 'Próximamente.', available: false },
  { key: 'whatsapp', icon: '💬', label: 'WhatsApp', hint: 'Próximamente.', available: false },
];

export default function NotificationPreferences() {
  const [channel, setChannel] = useState('email');

  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)', marginBottom: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 4 }}>Preferencias de notificación</div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#94a3b8' }}>
        Hoy te avisamos por correo cuando confirmas una reserva. Los demás canales están en camino.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {CHANNELS.map((c) => {
          const active = channel === c.key;
          return (
            <button
              key={c.key}
              onClick={() => c.available && setChannel(c.key)}
              disabled={!c.available}
              style={{
                textAlign: 'left', padding: 16, borderRadius: 14, cursor: c.available ? 'pointer' : 'default',
                border: `1.5px solid ${active ? '#4f46e5' : '#e2e8f0'}`,
                background: active ? '#eef2ff' : '#ffffff',
                opacity: c.available ? 1 : 0.55,
                position: 'relative',
              }}
            >
              {!c.available && (
                <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 9.5, fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: 999 }}>
                  PRÓXIMAMENTE
                </span>
              )}
              <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: active ? '#3730a3' : '#0f172a' }}>{c.label}</div>
              <div style={{ fontSize: 11.5, color: active ? '#4338ca' : '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>{c.hint}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
