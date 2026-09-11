import Modal from '../../../components/ui/Modal';
import { buildAdminTimeOptions, buildSedeSelectOptions } from '../adminSelectors';

const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 };
const labelStyle = { fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 };

export default function AdminNewReservationModal({ state, actions }) {
  const { adminForm, selectedDay, reservations, holds } = state;
  const sedeOptions = buildSedeSelectOptions();
  const { timeOptions, personaOptions } = buildAdminTimeOptions(adminForm, selectedDay, reservations, holds);

  return (
    <Modal maxWidth={460} scroll>
      <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 18 }}>+ Nueva reserva (admin)</div>
      <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
          <div>
            <label style={labelStyle}>Sede</label>
            <select value={adminForm.sedeId} onChange={(e) => actions.setAdminFormSede(e.target.value)} style={fieldStyle}>
              {sedeOptions.map((so) => <option key={so.id} value={so.id}>{so.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Horario</label>
            <select value={adminForm.time} onChange={(e) => actions.setAdminFormField('time', e.target.value)} style={fieldStyle}>
              {timeOptions.map((to) => <option key={to.time} value={to.time}>{to.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
          <div>
            <label style={labelStyle}>Personas</label>
            <select
              value={adminForm.personas}
              onChange={(e) => actions.setAdminFormField('personas', Number(e.target.value))}
              disabled={adminForm.exclusivo}
              style={fieldStyle}
            >
              {personaOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tarifa</label>
            <select value={adminForm.tarifa} onChange={(e) => actions.setAdminFormField('tarifa', e.target.value)} style={fieldStyle}>
              <option value="vecino">Vecino Surco</option>
              <option value="regular">Público general</option>
            </select>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
          <input type="checkbox" checked={adminForm.exclusivo} onChange={() => actions.setAdminFormField('exclusivo', !adminForm.exclusivo)} style={{ width: 16, height: 16 }} />
          Carril exclusivo
        </label>
        <input type="text" value={adminForm.nombre} onChange={(e) => actions.setAdminFormField('nombre', e.target.value)} placeholder="Nombre completo" style={fieldStyle} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
          <input type="text" value={adminForm.documento} onChange={(e) => actions.setAdminFormField('documento', e.target.value)} placeholder="DNI" style={fieldStyle} />
          <input
            type="tel" inputMode="numeric" maxLength={9} value={adminForm.telefono}
            onChange={(e) => actions.setAdminFormField('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="Teléfono" style={fieldStyle}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={actions.closeAdminNew} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
        <button onClick={actions.submitAdminReserva} style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Confirmar reserva</button>
      </div>
    </Modal>
  );
}
