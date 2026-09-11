const CHART_W = 460;
const CHART_H = 180;
const PAD_LEFT = 30;
const PAD_RIGHT = 10;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;

export default function ActivityChart({ weeks }) {
  const total = weeks.reduce((a, w) => a + w.count, 0);
  const promedio = weeks.length ? total / weeks.length : 0;
  const best = weeks.reduce((b, w) => (w.count > (b?.count ?? -1) ? w : b), null);
  const max = Math.max(1, ...weeks.map((w) => w.count));

  const plotW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;
  const step = weeks.length > 1 ? plotW / weeks.length : plotW;
  const barWidth = Math.min(40, step * 0.42);

  const points = weeks.map((w, i) => {
    const cx = PAD_LEFT + step * i + step / 2;
    const y = PAD_TOP + plotH - (w.count / max) * plotH;
    return { cx, y, w };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.y}`).join(' ');
  const gridFractions = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a' }}>Tu actividad este mes</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Visitas confirmadas por semana</div>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{total}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Promedio/sem</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{promedio.toFixed(1)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mejor semana</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#4f46e5' }}>{best ? best.label : '—'}</div>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ width: '100%', height: 200 }}>
        <defs>
          <linearGradient id="emussBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
        </defs>

        {gridFractions.map((f) => {
          const y = PAD_TOP + plotH * f;
          const value = Math.round(max * (1 - f));
          return (
            <g key={f}>
              <line x1={PAD_LEFT} x2={CHART_W - PAD_RIGHT} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={PAD_LEFT - 8} y={y + 3} fontSize="9.5" fill="#94a3b8" textAnchor="end">{value}</text>
            </g>
          );
        })}

        {points.map((p, i) => (
          <rect
            key={`bar-${i}`}
            x={p.cx - barWidth / 2}
            y={p.y}
            width={barWidth}
            height={PAD_TOP + plotH - p.y}
            rx={6}
            fill="url(#emussBarGradient)"
          />
        ))}

        <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.cx} cy={p.y} r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
        ))}

        {points.map((p, i) => (
          <text key={`label-${i}`} x={p.cx} y={CHART_H - 6} fontSize="10.5" fill="#64748b" fontWeight="600" textAnchor="middle">
            {p.w.label}
          </text>
        ))}
        {points.map((p, i) => (
          <text key={`count-${i}`} x={p.cx} y={p.y - 8} fontSize="11" fill="#3730a3" fontWeight="700" textAnchor="middle">
            {p.w.count > 0 ? p.w.count : ''}
          </text>
        ))}
      </svg>
    </div>
  );
}
