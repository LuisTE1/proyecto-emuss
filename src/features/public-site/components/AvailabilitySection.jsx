import DatePicker from './DatePicker';
import FilterBar from './FilterBar';
import SedeCard from './SedeCard';
import OmapedCard from './OmapedCard';

export default function AvailabilitySection({ calendar, filters, sedes, omaped }) {
  return (
    <section id="disponibilidad" style={{ background: 'rgba(248,250,252,0.5)' }}>
      <div className="emuss-pad" style={{ background: 'linear-gradient(100deg,#0f172a 0%,#312e81 50%,#4338ca 100%)', padding: 'clamp(56px,10vw,80px) 32px clamp(44px,8vw,64px)', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(30px,5vw,42px)', color: '#ffffff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>Disponibilidad</h2>
        <p style={{ color: '#e2e8f0', fontSize: 17, margin: 0 }}>Consulta la disponibilidad de nuestros <strong>carriles</strong> en tiempo real</p>
      </div>
      <div className="emuss-pad" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(48px,8vw,72px) 32px clamp(64px,10vw,112px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Elige una fecha</span>
          <DatePicker calendar={calendar} />
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto 40px', background: '#fffbeb', borderRadius: 16, padding: '18px 24px', fontWeight: 600, fontSize: 14, color: '#92400e', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #fef3c7' }}>
          <span style={{ fontSize: 18 }}>⏳</span> Los carriles en <strong>ámbar</strong> tienen 3 minutos para liberarse si no se completa la compra.
        </div>

        <FilterBar filters={filters} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
          {sedes.map((sede) => <SedeCard key={sede.id} sede={sede} />)}
          <OmapedCard omaped={omaped} />
        </div>
      </div>
    </section>
  );
}
