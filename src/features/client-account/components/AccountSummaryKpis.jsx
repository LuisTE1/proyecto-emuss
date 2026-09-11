export default function AccountSummaryKpis({ kpis }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 24 }}>
      {kpis.map((kpi) => (
        <div key={kpi.label} style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>{kpi.label}</div>
          <div style={{ fontWeight: 800, fontSize: 28, color: '#0f172a', letterSpacing: '-0.02em' }}>{kpi.value}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: kpi.trendColor, marginTop: 6 }}>{kpi.trend}</div>
        </div>
      ))}
    </div>
  );
}
