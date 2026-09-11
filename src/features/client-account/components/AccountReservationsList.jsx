const BADGE_STYLES = {
  cancelled: { background: '#fdf2f4', color: '#9d5570' },
  upcoming: { background: '#eef2ff', color: '#3730a3' },
  past: { background: '#f1f5f9', color: '#64748b' },
};

export default function AccountReservationsList({ reservations, onViewTicket }) {
  if (reservations.length === 0) {
    return (
      <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 8 }}>Mis reservas</div>
        <p style={{ margin: 0, fontSize: 13.5, color: '#64748b' }}>Todavía no tienes reservas. ¡Anímate a separar tu primer carril!</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 20 }}>Mis reservas</div>
      <div style={{ display: 'grid', gap: 12 }}>
        {reservations.map((r) => (
          <div key={r.code} style={{ border: '1px solid #f1f5f9', borderRadius: 14, padding: '14px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>{r.sedeName}</strong>
                <span style={{ padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 11, ...BADGE_STYLES[r.badgeVariant] }}>{r.estadoLabel}</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{r.fecha} · {r.time} · {r.personas} persona(s)</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{r.code}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onViewTicket(r.code)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                Ver ticket
              </button>
              {r.cancelable && (
                <button
                  onClick={r.onCancel}
                  style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
