export default function TrendChart({ trendPoints, trendDots }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Tendencia de reservas</div>
      <svg viewBox="0 0 300 140" style={{ width: '100%', height: 160 }}>
        <polyline points={trendPoints} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {trendDots.map((pt, i) => <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#4f46e5" />)}
      </svg>
    </div>
  );
}
