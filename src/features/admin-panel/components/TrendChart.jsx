export default function TrendChart({ trendPoints, trendDots }) {
  const gridY = [14, 70, 126];
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Tendencia de reservas</div>
      <svg viewBox="0 0 300 150" style={{ width: '100%', height: 170 }}>
        {gridY.map((y) => <line key={y} x1={0} x2={300} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />)}
        <polyline points={trendPoints} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {trendDots.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
            {pt.count > 0 && <text x={pt.x} y={pt.y - 10} fontSize="10" fontWeight="700" fill="#3730a3" textAnchor="middle">{pt.count}</text>}
            {pt.label && <text x={pt.x} y={144} fontSize="9" fill="#94a3b8" textAnchor="middle">{pt.label.split(' ')[1]}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}
