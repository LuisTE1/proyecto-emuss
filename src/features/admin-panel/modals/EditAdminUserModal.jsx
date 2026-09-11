import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { SEDES } from '../../../services/sedesService';

// MAQUETA VISUAL — modelo ABAC (alcance por sede + matriz de módulos) aún no
// conectado a rbacService; hoy el RBAC real solo soporta rol + 1 sede.
const ROLE_OPTIONS = ['Super Admin', 'Gerencia', 'Encargado de sede'];

const MODULES = [
  { key: 'analytics', label: 'Ver Dashboard de Analítica' },
  { key: 'reservas', label: 'Gestionar Reservas' },
  { key: 'reportes', label: 'Exportar Reportes (CSV)' },
  { key: 'accesos', label: 'Gestión de Accesos', accent: '#059669' },
  { key: 'mantenimiento', label: 'Mantenimiento de Sedes', accent: '#d97706' },
];

const DANGER_MODULE = { key: 'panico', label: 'Activar Modo Pánico / Emergencia', accent: '#dc2626' };

function Checkbox({ checked, onChange, label, accent, danger }) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 12, padding: '12px 14px',
        fontSize: 13, fontWeight: 600, color: danger ? '#b91c1c' : '#334155', cursor: 'pointer',
        border: `1.5px solid ${accent || '#f1f5f9'}`,
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 16, height: 16 }} />
      {label}
    </label>
  );
}

export default function EditAdminUserModal({ user, onCancel, onSave, onDelete }) {
  const [rol, setRol] = useState(user.rol);
  const [sedeIds, setSedeIds] = useState(user.sedeIds || SEDES.map((s) => s.id));
  const [modules, setModules] = useState(user.modules || { analytics: true, reservas: true, reportes: false, accesos: false, mantenimiento: false, panico: false });

  const toggleSede = (id) => setSedeIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  const toggleModule = (key) => setModules((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Modal maxWidth={720} scroll>
      <div style={{ fontWeight: 800, fontSize: 19, color: '#0f172a', marginBottom: 4 }}>
        Editando Usuario: <span style={{ color: '#4f46e5' }}>{user.nombre}</span>
      </div>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: '#94a3b8' }}>{user.correo}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>Rol de Sistema</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 }}>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>Sedes Asignadas (Alcance)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SEDES.map((sede) => {
              const checked = sedeIds.includes(sede.id);
              return (
                <button
                  key={sede.id}
                  onClick={() => toggleSede(sede.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${checked ? '#c7d2fe' : '#e2e8f0'}`, background: checked ? '#eef2ff' : '#ffffff',
                    color: checked ? '#3730a3' : '#64748b', fontWeight: 600, fontSize: 12.5,
                  }}
                >
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: checked ? '#4f46e5' : '#ffffff', border: `1.5px solid ${checked ? '#4f46e5' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>
                    {checked ? '✓' : ''}
                  </span>
                  {sede.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 10 }}>Módulos Permitidos</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginBottom: 12 }}>
        {MODULES.map((m) => (
          <Checkbox key={m.key} checked={!!modules[m.key]} onChange={() => toggleModule(m.key)} label={m.label} accent={m.accent} />
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <Checkbox checked={!!modules[DANGER_MODULE.key]} onChange={() => toggleModule(DANGER_MODULE.key)} label={DANGER_MODULE.label} accent={DANGER_MODULE.accent} danger />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onSave({ rol, sedeIds, modules })}
            style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Guardar Cambios
          </button>
          <button onClick={onCancel} style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
        <button
          onClick={onDelete}
          style={{ padding: '13px 22px', borderRadius: 12, border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          🗑 Eliminar Usuario
        </button>
      </div>
    </Modal>
  );
}
