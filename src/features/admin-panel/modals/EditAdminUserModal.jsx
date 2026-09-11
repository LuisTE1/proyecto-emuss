import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { SEDES } from '../../../services/sedesService';

const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 };
const labelStyle = { fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 };

export default function EditAdminUserModal({ user, onCancel, onSave, onDelete }) {
  const [rol, setRol] = useState(user.rol);
  const [sedeId, setSedeId] = useState(user.sedeId || SEDES[0].id);

  return (
    <Modal maxWidth={460}>
      <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 4 }}>
        Editando Usuario: <span style={{ color: '#4f46e5' }}>{user.nombre}</span>
      </div>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: '#94a3b8' }}>{user.correo}</p>

      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Rol de sistema</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)} style={fieldStyle}>
            <option value="Super Admin">Super Admin</option>
            <option value="Encargado de sede">Encargado de sede</option>
          </select>
        </div>

        {rol !== 'Super Admin' && (
          <div>
            <label style={labelStyle}>Sede asignada</label>
            <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} style={fieldStyle}>
              {SEDES.map((sede) => <option key={sede.id} value={sede.id}>{sede.name}</option>)}
            </select>
          </div>
        )}
        {rol === 'Super Admin' && (
          <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8' }}>Un Super Admin ve y administra todas las sedes.</p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onSave({ rol, sedeId })}
            style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Guardar cambios
          </button>
          <button onClick={onCancel} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
        <button
          onClick={onDelete}
          style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          🗑 Quitar acceso de administrador
        </button>
      </div>
    </Modal>
  );
}
