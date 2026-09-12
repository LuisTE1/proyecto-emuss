const SECTIONS = [
  { key: 'resumen', icon: '📊', label: 'Resumen' },
  { key: 'reservas', icon: '📅', label: 'Reservas' },
  { key: 'checkin', icon: '🎫', label: 'Check-in' },
  { key: 'control', icon: '🏊', label: 'Control de piscina' },
  { key: 'mantenimiento', icon: '🛠️', label: 'Mantenimiento' },
  { key: 'reportes', icon: '📈', label: 'Reportes' },
  { key: 'clientes', icon: '👥', label: 'Clientes' },
  { key: 'accesos', icon: '🔐', label: 'Equipo' },
  { key: 'auditoria', icon: '🗒️', label: 'Auditoría' },
];

function itemStyle(active) {
  return {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
    padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap',
    background: active ? '#4f46e5' : 'transparent', color: active ? '#ffffff' : '#334155',
  };
}

export default function AdminSidebar({ active, onChange, session, onLogout }) {
  return (
    <nav
      className="emuss-scroll"
      style={{
        flex: '0 0 240px', display: 'flex', flexDirection: 'column', gap: 4,
        background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20,
        padding: 16, boxShadow: '0 4px 24px rgba(15,23,42,0.04)', alignSelf: 'flex-start',
        position: 'sticky', top: 88,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 18px' }}>
        <span style={{ fontSize: 22 }}>🌊</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.01em' }}>EMUSS</div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Administración</div>
        </div>
      </div>

      {SECTIONS.map((s) => (
        <button key={s.key} onClick={() => onChange(s.key)} style={itemStyle(active === s.key)}>
          <span>{s.icon}</span>{s.label}
        </button>
      ))}

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
        {session && (
          <div style={{ padding: '0 10px 10px', fontSize: 12, color: '#64748b' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{session.nombre}</div>
            <div>{session.rol}</div>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{ width: '100%', padding: '9px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', cursor: 'pointer' }}
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
