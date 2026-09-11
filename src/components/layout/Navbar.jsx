function accountButtonLabel(session) {
  if (!session) return '👤 Mi cuenta';
  if (session.type === 'admin') return `⚙ ${session.nombre.split(' ')[0]} (Admin)`;
  return `👤 ${session.nombre.split(' ')[0]}`;
}

export default function Navbar({ view, session, onGoToAccount, onGoToPublic }) {
  const isPublicView = view === 'public';

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76, gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6c1.5 1.5 3 1.5 4.5 0S9.5 4.5 11 6s3 1.5 4.5 0 3-1.5 4.5 0" />
            <path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
            <path d="M2 18c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#0f172a' }}>EMUSS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 14.5, fontWeight: 600, flexWrap: 'wrap' }}>
          {isPublicView ? (
            <>
              <span className="emuss-navlinks" style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                <a href="#inicio" style={{ color: '#334155' }}>Inicio</a>
                <a href="#beneficios" style={{ color: '#334155' }}>Beneficios</a>
                <a href="#disponibilidad" style={{ color: '#334155' }}>Disponibilidad</a>
                <a href="#piscinas" style={{ color: '#334155' }}>Nuestras Piscinas</a>
              </span>
              <button
                onClick={onGoToAccount}
                style={{
                  padding: '9px 16px', fontSize: 13, fontWeight: 700, borderRadius: 999, cursor: 'pointer',
                  border: session?.type === 'admin' ? 'none' : '1.5px solid #e2e8f0',
                  background: session?.type === 'admin' ? '#0f172a' : '#ffffff',
                  color: session?.type === 'admin' ? '#ffffff' : '#334155',
                }}
              >
                {accountButtonLabel(session)}
              </button>
            </>
          ) : (
            <button
              onClick={onGoToPublic}
              style={{ padding: '9px 16px', fontSize: 13, fontWeight: 700, borderRadius: 999, border: 'none', background: '#0f172a', color: '#ffffff', cursor: 'pointer' }}
            >
              ← Volver al sitio
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
