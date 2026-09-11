import { useState } from 'react';
import { buildRbacRows, buildSedeSelectOptions } from '../adminSelectors';
import EditAdminUserModal from '../modals/EditAdminUserModal';

const th = { padding: '10px 8px', fontSize: 12, color: '#94a3b8', fontWeight: 700 };
const td = { padding: '10px 8px', fontSize: 13, color: '#334155', whiteSpace: 'nowrap' };
const selectStyle = { padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12.5 };

export default function AccessManagementTab({ state, actions }) {
  const rows = buildRbacRows(state.rbacUsers, actions);
  const sedeOptions = buildSedeSelectOptions();
  // MAQUETA VISUAL: el modal ABAC (abajo) aún no persiste en rbacService.
  const [editingUser, setEditingUser] = useState(null);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a' }}>Usuarios administradores</div>
        <button onClick={actions.openRbacAdd} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          + Agregar administrador
        </button>
      </div>
      <div className="emuss-table-wrap">
        <table>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
              <th style={th}>Nombre</th>
              <th style={th}>Correo</th>
              <th style={th}>Rol</th>
              <th style={th}>Sede asignada</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ ...td, fontWeight: 700 }}>{u.nombre}</td>
                <td style={td}>{u.correo}</td>
                <td style={{ padding: '10px 8px' }}>
                  <select value={u.rol} onChange={(e) => u.onRolChange(e.target.value)} style={selectStyle}>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Encargado de sede">Encargado de sede</option>
                  </select>
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <select value={u.sedeId} onChange={(e) => u.onSedeChange(e.target.value)} disabled={u.sedeDisabled} style={selectStyle}>
                    {sedeOptions.map((so) => <option key={so.id} value={so.id}>{so.name}</option>)}
                  </select>
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <button
                    onClick={() => setEditingUser(u)}
                    title="Vista previa del panel ABAC (maqueta)"
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#3730a3', fontWeight: 700, fontSize: 11.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Editar (ABAC)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditAdminUserModal
          user={editingUser}
          onCancel={() => setEditingUser(null)}
          onSave={() => setEditingUser(null)}
          onDelete={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
