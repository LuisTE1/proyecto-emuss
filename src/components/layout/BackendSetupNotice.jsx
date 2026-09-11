const codeStyle = { background: '#0f172a', color: '#e2e8f0', borderRadius: 10, padding: '12px 16px', fontFamily: 'monospace', fontSize: 12.5, overflowX: 'auto' };

export default function BackendSetupNotice() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
      <div style={{ background: '#ffffff', borderRadius: 28, maxWidth: 620, width: '100%', padding: 'clamp(28px,5vw,40px)', boxShadow: '0 24px 60px rgba(15,23,42,0.08)', border: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#818cf8', fontWeight: 700, marginBottom: 10 }}>
          Backend no conectado
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 26, margin: '0 0 12px', color: '#0f172a', letterSpacing: '-0.02em' }}>
          Falta conectar Supabase
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 14.5, color: '#475569', lineHeight: 1.6 }}>
          La app ya está lista para usar un backend real (reservas, login, panel admin), pero
          todavía no tiene las credenciales de tu proyecto Supabase.
        </p>

        <ol style={{ margin: '0 0 24px', paddingLeft: 20, display: 'grid', gap: 16, fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
          <li>
            Crea un proyecto gratis en <strong>supabase.com</strong>.
          </li>
          <li>
            Abre el <strong>SQL Editor</strong> de tu proyecto y corre, en orden, los dos archivos de{' '}
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>supabase/migrations/</code>{' '}
            (<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>0001_init.sql</code> y luego{' '}
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>0002_holds_and_realtime.sql</code>).
          </li>
          <li>
            Copia tu <strong>Project URL</strong> y <strong>anon key</strong> (Settings → API) a un archivo{' '}
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>.env</code> en la raíz del proyecto:
            <div style={codeStyle}>
              VITE_SUPABASE_URL=https://tu-proyecto.supabase.co<br />
              VITE_SUPABASE_ANON_KEY=tu-anon-key
            </div>
          </li>
          <li>
            Crea tu primer <strong>Super Admin</strong>: registra ese usuario (Authentication → Users → Add user), copia su UID
            y corre el <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>insert into admin_users...</code> que
            está al final del mismo archivo SQL.
          </li>
          <li>
            Reinicia el servidor (<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>npm run dev</code>).
          </li>
        </ol>

        <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8' }}>
          Detalle completo en el README, sección "Backend (Supabase)".
        </p>
      </div>
    </div>
  );
}
