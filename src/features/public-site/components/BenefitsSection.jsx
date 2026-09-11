function BenefitCard({ children, title, text }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 20, padding: 28, border: '1px solid #f1f5f9' }}>
      {children}
      <div style={{ fontWeight: 700, fontSize: 15.5, margin: '16px 0 6px', color: '#0f172a' }}>{title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#64748b' }}>{text}</div>
    </div>
  );
}

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="emuss-pad" style={{ background: '#ffffff', padding: 'clamp(64px,10vw,128px) 32px' }}>
      <div className="emuss-2col" style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 36, margin: '0 0 24px', letterSpacing: '-0.02em', color: '#0f172a' }}>EMUSS es para todos</h2>
          <div style={{ display: 'grid', gap: 16, fontSize: 16.5, lineHeight: 1.7, color: '#475569', maxWidth: '52ch' }}>
            <p style={{ margin: 0 }}>¿Buscas un espacio seguro para rehabilitación física?</p>
            <p style={{ margin: 0 }}>¿Quieres un carril de nado libre sin aglomeraciones?</p>
            <p style={{ margin: 0 }}>¿Necesitas infraestructura adaptada para tu familia?</p>
          </div>
          <p style={{ fontWeight: 700, fontSize: 18, margin: '24px 0 32px', color: '#0f172a' }}>
            Centralizamos nuestras piscinas para darte el espacio exacto que necesitas.
          </p>
          <div style={{ background: '#eef2ff', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
              <circle cx="12" cy="6" r="2" />
              <path d="M8 20c0-2.5 1.8-4 4-4s4 1.5 4 4" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', color: '#312e81' }}>EMUSS Inclusivo</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20 }}>
          <BenefitCard title="Accesibilidad Motriz" text="Complejos equipados con rampas de ingreso y elevadores hidráulicos para el agua.">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="16" r="6" /><path d="M12 10V4" /><path d="M8 4h8" /><path d="m19 12 1 4" />
            </svg>
          </BenefitCard>
          <BenefitCard title="Nado Libre Sin Estrés" text="Garantizamos un máximo de 3 nadadores por carril para entrenamientos óptimos.">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
          </BenefitCard>
          <BenefitCard title="Piscinas Paternas" text="Espacios de baja profundidad ideales para matronatación y niños pequeños.">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="6" r="3" /><path d="M6 21c0-4 2.5-6 6-6s6 2 6 6" />
            </svg>
          </BenefitCard>
          <BenefitCard title="Reserva Flexible" text="Separa bloques de entrenamiento desde 30 minutos sin mensualidades forzosas.">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18.1" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
            </svg>
          </BenefitCard>
        </div>
      </div>
    </section>
  );
}
