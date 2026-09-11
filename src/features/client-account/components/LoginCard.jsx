const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 };
const labelStyle = { fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 };

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
        background: active ? '#4f46e5' : 'transparent', color: active ? '#ffffff' : '#64748b',
      }}
    >
      {children}
    </button>
  );
}

export default function LoginCard({ mode, form, error, loading, onChangeMode, onChangeField, onSubmit }) {
  const isRegister = mode === 'register';

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
      <div style={{ background: '#ffffff', borderRadius: 28, maxWidth: 420, width: '100%', padding: 'clamp(24px,5vw,36px)', boxShadow: '0 24px 60px rgba(15,23,42,0.08)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#0f172a' }}>EMUSS</span>
        </div>

        <div style={{ display: 'flex', gap: 6, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          <TabButton active={!isRegister} onClick={() => onChangeMode('login')}>Iniciar sesión</TabButton>
          <TabButton active={isRegister} onClick={() => onChangeMode('register')}>Crear cuenta</TabButton>
        </div>

        {error && (
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: 14, marginBottom: 22 }}>
          {isRegister && (
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input type="text" value={form.nombre} onChange={(e) => onChangeField('nombre', e.target.value)} placeholder="Ej. María Torres" style={fieldStyle} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input type="email" value={form.correo} onChange={(e) => onChangeField('correo', e.target.value)} placeholder="tu@correo.com" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Contraseña</label>
            <input type="password" value={form.password} onChange={(e) => onChangeField('password', e.target.value)} placeholder="••••••••" style={fieldStyle} />
          </div>
          {isRegister && (
            <div>
              <label style={labelStyle}>DNI</label>
              <input
                type="text" inputMode="numeric" maxLength={8} value={form.dni}
                onChange={(e) => onChangeField('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="********" style={fieldStyle}
              />
            </div>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none', color: '#ffffff', fontWeight: 700, fontSize: 14.5,
            cursor: loading ? 'default' : 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.28)',
            background: loading ? '#a5b4fc' : '#4f46e5',
          }}
        >
          {loading ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Ingresar'}
        </button>

        <p style={{ margin: '14px 0 0', fontSize: 12.5, color: '#94a3b8', textAlign: 'center' }}>
          Al continuar aceptas nuestros Términos y Política de privacidad.
        </p>
      </div>
    </div>
  );
}
