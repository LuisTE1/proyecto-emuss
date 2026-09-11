export default function RecommendationsPanel({ items, onGoToDisponibilidad }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Recomendaciones para ti</div>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13.5, color: '#64748b', lineHeight: 1.55 }}>
          Aún no tenemos suficientes datos de tus visitas para recomendarte algo. ¡Reserva un par de veces más y aquí verás sugerencias basadas en tu historial!
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((rec) => (
            <div key={rec.title} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{rec.icon}</span>
                <strong style={{ fontSize: 14, color: '#3730a3' }}>{rec.title}</strong>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#3730a3', lineHeight: 1.5 }}>{rec.text}</p>
              <button
                onClick={onGoToDisponibilidad}
                style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                Ver disponibilidad
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
