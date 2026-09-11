import { useState } from 'react';

// MAQUETA VISUAL — preferencia de canal aún no conectada a un notificationsService real.
const CHANNELS = [
  { key: 'push', icon: '🔔', label: 'App (push)', hint: 'Instala EMUSS como app para recibir avisos al instante.' },
  { key: 'email', icon: '📧', label: 'Correo', hint: 'Te escribimos a tu correo registrado.' },
  { key: 'whatsapp', icon: '💬', label: 'WhatsApp', hint: 'Te avisamos por WhatsApp a tu número registrado.' },
];

function Toggle({ checked, onChange, title, text }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 14, padding: '14px 16px', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: '#334155' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{text}</div>
      </div>
    </label>
  );
}

export default function NotificationPreferences() {
  const [channel, setChannel] = useState('push');
  const [alertCupoLiberado, setAlertCupoLiberado] = useState(true);
  const [alertHorarioOcupado, setAlertHorarioOcupado] = useState(true);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)', marginBottom: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 4 }}>Preferencias de notificación</div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#94a3b8' }}>
        Elige cómo prefieres que te avisemos. Si tienes la app instalada, siempre priorizamos push.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 22 }}>
        {CHANNELS.map((c) => {
          const active = channel === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setChannel(c.key)}
              style={{
                textAlign: 'left', padding: 16, borderRadius: 14, cursor: 'pointer',
                border: `1.5px solid ${active ? '#4f46e5' : '#e2e8f0'}`,
                background: active ? '#eef2ff' : '#ffffff',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: active ? '#3730a3' : '#0f172a' }}>{c.label}</div>
              <div style={{ fontSize: 11.5, color: active ? '#4338ca' : '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>{c.hint}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <Toggle
          checked={alertCupoLiberado}
          onChange={() => setAlertCupoLiberado((v) => !v)}
          title="Avisarme cuando se libere un cupo en mis sedes habituales"
          text="Detectamos tus horarios frecuentes y te avisamos apenas haya lugar, antes que otros lo vean."
        />
        <Toggle
          checked={alertHorarioOcupado}
          onChange={() => setAlertHorarioOcupado((v) => !v)}
          title="Avisarme si mi horario habitual ya está reservado"
          text="Si tu sede y horario de siempre están llenos, te sugerimos la alternativa más cercana disponible."
        />
      </div>
    </div>
  );
}
