import { findSedeById } from '../../../services/sedesService';

export default function AdminHeader({ panicActive, session, onLogout }) {
  const sedeName = session?.sedeId ? findSedeById(session.sedeId)?.name : null;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
      <div>
        <div style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#818cf8', fontWeight: 700, marginBottom: 8 }}>
          Panel Operativo
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 32, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>Administración EMUSS</h1>
        {session && (
          <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 8 }}>
            Conectado como <strong style={{ color: '#334155' }}>{session.nombre}</strong> · {session.rol}
            {sedeName ? ` · ${sedeName}` : ''}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {panicActive && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 999 }}>
            🚨 Modo pánico activo — nuevas reservas bloqueadas
          </div>
        )}
        <button
          onClick={onLogout}
          style={{ padding: '9px 16px', fontSize: 13, fontWeight: 700, borderRadius: 999, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', cursor: 'pointer' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
