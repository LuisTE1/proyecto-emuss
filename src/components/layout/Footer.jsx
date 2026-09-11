export default function Footer() {
  return (
    <footer className="emuss-pad" style={{ background: '#0f172a', color: '#ffffff', padding: '64px 32px 44px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 16 }}>EMUSS</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
          <a href="#" style={{ color: '#ffffff', opacity: 0.8 }}>Instagram</a>
          <a href="#" style={{ color: '#ffffff', opacity: 0.8 }}>Facebook</a>
          <a href="#" style={{ color: '#ffffff', opacity: 0.8 }}>TikTok</a>
        </div>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff', fontSize: 14, fontWeight: 600, opacity: 0.9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Libro de Reclamaciones
        </a>
      </div>
      <div style={{ maxWidth: 1320, margin: '36px auto 0', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 22, fontSize: 12, opacity: 0.55 }}>
        © 2026 EMUSS — Todos los derechos reservados.
      </div>
    </footer>
  );
}
