import Modal from '../../../components/ui/Modal';

const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 };
const labelStyle = { fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 };

export default function ReservationFormModal({
  sedeName, slotTime, countdownLabel, tarifaVecino, tarifaRegular, totalPrecio,
  form, personaOptions, onChangeField, onCancel, onSubmit, onExtendTime,
}) {
  return (
    <Modal maxWidth={460} scroll>
      <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: 16, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#075985' }}>🔒 Guardamos tu cupo mientras completas el formulario</span>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em', whiteSpace: 'nowrap', marginLeft: 10, color: '#075985' }}>{countdownLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 12.5, color: '#0369a1' }}>Tómate tu tiempo, puedes extenderlo cuando quieras.</span>
          <button
            onClick={onExtendTime}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #bae6fd', background: '#ffffff', color: '#075985', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + 2 min
          </button>
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.01em' }}>{sedeName}</div>
      <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Horario: <strong>{slotTime}</strong> · Tiempo: <strong>1 hora</strong></div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>
        Vecino Surco: <strong style={{ color: '#334155' }}>{tarifaVecino}</strong> · Público general: <strong style={{ color: '#334155' }}>{tarifaRegular}</strong>
      </div>

      <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
          <div>
            <label style={labelStyle}>¿Cuántas personas van contigo?</label>
            <select
              value={form.personas}
              onChange={(e) => onChangeField('personas', Number(e.target.value))}
              disabled={form.exclusivo}
              style={{ ...fieldStyle, background: '#ffffff' }}
            >
              {personaOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tarifa</label>
            <select value={form.tarifa} onChange={(e) => onChangeField('tarifa', e.target.value)} style={{ ...fieldStyle, background: '#ffffff' }}>
              <option value="vecino">Vecino Surco</option>
              <option value="regular">Público general</option>
            </select>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.exclusivo} onChange={() => onChangeField('exclusivo', !form.exclusivo)} style={{ width: 16, height: 16 }} />
          Quiero el carril solo para mi grupo (exclusivo)
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eef2ff', borderRadius: 12, padding: '12px 16px', fontSize: 13.5, fontWeight: 700, color: '#3730a3' }}>
          <span>Total a pagar</span><span style={{ fontSize: 17 }}>{totalPrecio}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 14 }}>
          <div>
            <label style={labelStyle}>Tipo de documento</label>
            <select value={form.tipoDocumento} onChange={(e) => onChangeField('tipoDocumento', e.target.value)} style={{ ...fieldStyle, background: '#ffffff' }}>
              <option value="DNI">DNI</option>
              <option value="CE">Carné de extranjería</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Número de documento</label>
            <input type="text" value={form.documento} onChange={(e) => onChangeField('documento', e.target.value)} placeholder="********" style={fieldStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Nombres</label>
          <input type="text" value={form.nombres} onChange={(e) => onChangeField('nombres', e.target.value)} placeholder="Ej. María" style={fieldStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
          <div>
            <label style={labelStyle}>Apellido paterno</label>
            <input type="text" value={form.apellidoPaterno} onChange={(e) => onChangeField('apellidoPaterno', e.target.value)} placeholder="Torres" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Apellido materno</label>
            <input type="text" value={form.apellidoMaterno} onChange={(e) => onChangeField('apellidoMaterno', e.target.value)} placeholder="Ríos" style={fieldStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input type="text" value={form.telefono} onChange={(e) => onChangeField('telefono', e.target.value)} placeholder="9********" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input type="email" value={form.correo} onChange={(e) => onChangeField('correo', e.target.value)} placeholder="tu@correo.com" style={fieldStyle} />
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 16, padding: 18, marginBottom: 24 }}>
        <label style={{ ...labelStyle, marginBottom: 4 }}>¿Necesitas alguna facilidad de acceso? (opcional)</label>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
          Así el personal de la sede te tiene listo lo que necesites antes de que llegues.
        </p>
        <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.necesitaElevador} onChange={() => onChangeField('necesitaElevador', !form.necesitaElevador)} style={{ width: 16, height: 16 }} />
            Elevador hidráulico para ingresar al agua
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.necesitaRampa} onChange={() => onChangeField('necesitaRampa', !form.necesitaRampa)} style={{ width: 16, height: 16 }} />
            Rampa de acceso / silla de ruedas
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.necesitaAsistencia} onChange={() => onChangeField('necesitaAsistencia', !form.necesitaAsistencia)} style={{ width: 16, height: 16 }} />
            Apoyo auditivo o visual
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.vaConCuidador} onChange={() => onChangeField('vaConCuidador', !form.vaConCuidador)} style={{ width: 16, height: 16 }} />
            Vengo acompañado de un cuidador o asistente
          </label>
        </div>
        <label style={{ ...labelStyle, marginBottom: 6 }}>Cuéntanos más (opcional)</label>
        <textarea
          value={form.notasAccesibilidad}
          onChange={(e) => onChangeField('notasAccesibilidad', e.target.value)}
          placeholder="Ej. Necesito ayuda para bajar las escaleras del borde de la piscina"
          rows={2}
          style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
        <button onClick={onSubmit} style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.28)' }}>🛒 Agregar al carrito</button>
      </div>
    </Modal>
  );
}
