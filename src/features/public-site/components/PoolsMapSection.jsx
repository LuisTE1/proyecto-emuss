export default function PoolsMapSection({ mapSedes }) {
  return (
    <section id="piscinas" className="emuss-pad" style={{ background: '#ffffff', padding: 'clamp(64px,10vw,128px) 32px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <h2 style={{ fontWeight: 800, fontSize: 34, margin: '0 0 12px', color: '#0f172a', letterSpacing: '-0.02em' }}>Nuestras piscinas</h2>
        <p style={{ fontSize: 16, margin: '0 0 40px', color: '#475569' }}>
          ¿Tienes alguna consulta adicional? Escríbenos al Centro de Atención: <a href="mailto:contacto@emuss.pe" style={{ color: '#4f46e5', fontWeight: 700 }}>contacto@emuss.pe</a>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 28 }}>
          {mapSedes.map((m) => (
            <div key={m.name}>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, color: '#0f172a' }}>{m.name}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>{m.address}</div>
              <div style={{ aspectRatio: '1/1', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
                <iframe title={m.name} src={m.mapSrc} width="100%" height="100%" style={{ border: 0, display: 'block' }} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
