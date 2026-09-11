import SlotButton from './SlotButton';

export default function SedeCard({ sede }) {
  return (
    <div style={{ borderRadius: 20, background: '#ffffff', boxShadow: '0 4px 24px rgba(15,23,42,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, marginBottom: 4, color: '#0f172a', letterSpacing: '-0.01em' }}>{sede.name}</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{sede.address}</div>
          <a
            href={sede.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: '#4f46e5', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            📍 Cómo llegar
          </a>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10, padding: '20px 20px 24px' }}>
        {sede.slots.map((slot) => <SlotButton key={slot.time} slot={slot} />)}
        {sede.recommendation && (
          <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 14, padding: 14, marginTop: 4 }}>
            <div style={{ fontSize: 12.5, color: '#3730a3', lineHeight: 1.5, marginBottom: 10 }}>
              💡 {sede.recommendation.text}
            </div>
            <button
              onClick={sede.recommendation.onClick}
              style={{ width: '100%', padding: 10, borderRadius: 10, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', boxShadow: '0 6px 16px rgba(79,70,229,0.25)' }}
            >
              {sede.recommendation.ctaLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
