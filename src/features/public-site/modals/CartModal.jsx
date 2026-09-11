import Modal from '../../../components/ui/Modal';

function Row({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <strong style={strong}>{value}</strong>
    </div>
  );
}

export default function CartModal({ sedeName, slotTime, personas, rateLabel, ratePrice, totalPrecio, countdownLabel, accesibilidadLabel, metodoPagoLabel, acompanantesLabel, confirming, onBack, onConfirm }) {
  return (
    <Modal maxWidth={440} scroll>
      <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: 16, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#075985' }}>🔒 Tu cupo sigue guardado</span>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em', color: '#075985' }}>{countdownLabel}</span>
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.01em' }}>Resumen de tu reserva</div>
      <div style={{ display: 'grid', gap: 10, fontSize: 14, color: '#334155', background: '#f8fafc', borderRadius: 14, padding: 18, marginBottom: 22 }}>
        <Row label="Sede" value={sedeName} />
        <Row label="Horario" value={`${slotTime} (1 hora)`} />
        <Row label="Personas" value={personas} />
        {acompanantesLabel && <Row label="Acompañantes" value={acompanantesLabel} />}
        <Row label="Tarifa" value={`${rateLabel} (${ratePrice})`} />
        <Row label="Método de pago" value={metodoPagoLabel} />
        {accesibilidadLabel && <Row label="Accesibilidad" value={accesibilidadLabel} />}
        <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: 4, paddingTop: 10 }}>
          <Row label="Total" value={totalPrecio} strong={{ color: '#4f46e5', fontSize: 16 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onBack} disabled={confirming} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: confirming ? 'default' : 'pointer' }}>Volver</button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          style={{
            padding: '13px 22px', borderRadius: 12, border: 'none', color: '#ffffff', fontWeight: 700, fontSize: 14,
            cursor: confirming ? 'default' : 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.28)',
            background: confirming ? '#a5b4fc' : '#4f46e5',
          }}
        >
          {confirming ? 'Confirmando…' : 'Confirmar reserva'}
        </button>
      </div>
    </Modal>
  );
}
