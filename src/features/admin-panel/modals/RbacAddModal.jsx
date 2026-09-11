import Modal from '../../../components/ui/Modal';
import { buildSedeSelectOptions } from '../adminSelectors';

const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 };

export default function RbacAddModal({ state, actions }) {
  const { rbacForm } = state;
  const sedeOptions = buildSedeSelectOptions();
  const showSede = rbacForm.rol !== 'Super Admin';

  return (
    <Modal maxWidth={420}>
      <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 18 }}>+ Agregar administrador</div>
      <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
        <input type="text" value={rbacForm.nombre} onChange={(e) => actions.setRbacFormField('nombre', e.target.value)} placeholder="Nombre completo" style={fieldStyle} />
        <input type="email" value={rbacForm.correo} onChange={(e) => actions.setRbacFormField('correo', e.target.value)} placeholder="correo@emuss.pe" style={fieldStyle} />
        <select value={rbacForm.rol} onChange={(e) => actions.setRbacFormField('rol', e.target.value)} style={fieldStyle}>
          <option value="Encargado de sede">Encargado de sede</option>
          <option value="Super Admin">Super Admin</option>
        </select>
        {showSede && (
          <select value={rbacForm.sedeId} onChange={(e) => actions.setRbacFormField('sedeId', e.target.value)} style={fieldStyle}>
            {sedeOptions.map((so) => <option key={so.id} value={so.id}>{so.name}</option>)}
          </select>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={actions.closeRbacAdd} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
        <button onClick={actions.submitRbacAdd} style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Agregar</button>
      </div>
    </Modal>
  );
}
