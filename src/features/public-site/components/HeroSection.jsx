export default function HeroSection() {
  return (
    <header
      id="inicio"
      className="emuss-pad"
      style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#312e81 55%,#4338ca 100%)',
        padding: 'clamp(72px,14vw,130px) 32px clamp(64px,12vw,116px)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 15%, rgba(129,140,248,0.25), transparent 55%)' }} />
      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
        <div style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a5b4fc', fontWeight: 700, marginBottom: 24 }}>
          Red de complejos acuáticos EMUSS
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(42px,6.4vw,78px)', lineHeight: 1.02, color: '#ffffff', margin: '0 0 24px', letterSpacing: '-0.03em' }}>
          Disponibilidad de<br />Piscinas
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, color: '#e2e8f0', maxWidth: 600, margin: 0, fontWeight: 400 }}>
          Consulta y reserva los carriles de nuestra red de complejos acuáticos en tiempo real.
        </p>
      </div>
    </header>
  );
}
