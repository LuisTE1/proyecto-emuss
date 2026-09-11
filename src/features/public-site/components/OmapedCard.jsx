export default function OmapedCard({ omaped }) {
  return (
    <div style={{ borderRadius: 20, background: '#ffffff', boxShadow: '0 4px 24px rgba(15,23,42,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, marginBottom: 4, color: '#0f172a', letterSpacing: '-0.01em' }}>{omaped.name}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{omaped.address}</div>
      </div>
      <div style={{ padding: '20px 20px 24px', display: 'grid', gap: 14 }}>
        <span style={{ display: 'inline-flex', width: 'fit-content', background: '#f0f9ff', color: '#075985', border: '1px solid #e0f2fe', borderRadius: 999, padding: '6px 12px', fontSize: 11.5, fontWeight: 700 }}>
          Servicio terapéutico — requiere evaluación previa
        </span>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{omaped.note}</p>
        <button style={{ padding: 12, borderRadius: 12, border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#3730a3', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Más información / Contactar
        </button>
      </div>
    </div>
  );
}
