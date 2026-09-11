import { useState } from 'react';
import { SEDES, findSedeById } from '../../../services/sedesService';
import { dayLabel, todayISO } from '../../../utils/dateUtils';

const fieldStyle = { padding: '9px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 12.5 };

export default function MaintenancePanel({ rows, closures, session, onAddClosure, onRemoveClosure }) {
  const isSuperAdmin = session?.rol === 'Super Admin';
  const ownSedeId = session?.sedeId || SEDES[0].id;
  const [sedeId, setSedeId] = useState(isSuperAdmin ? SEDES[0].id : ownSedeId);
  const [fecha, setFecha] = useState(todayISO());
  const [motivo, setMotivo] = useState('');

  const upcomingClosures = closures
    .filter((c) => c.fecha >= todayISO() && (isSuperAdmin || c.sedeId === ownSedeId))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));

  const handleSubmit = () => {
    if (!fecha) return;
    onAddClosure(isSuperAdmin ? sedeId : ownSedeId, fecha, motivo);
    setMotivo('');
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0f172a', marginBottom: 16 }}>Mantenimiento de sedes</div>
      <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {rows.map((row) => (
          <div key={row.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#334155' }}>{row.name}</span>
            <button
              onClick={row.onClick}
              style={{
                padding: '7px 14px', fontSize: 12, fontWeight: 700, borderRadius: 999, cursor: 'pointer',
                border: row.on ? 'none' : '1px solid #e2e8f0',
                background: row.on ? '#fef3c7' : '#ffffff', color: row.on ? '#92400e' : '#64748b',
              }}
            >
              {row.label}
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Cerrar un día completo (no abre)</div>
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          {isSuperAdmin && (
            <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} style={fieldStyle}>
              {SEDES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <input type="date" value={fecha} min={todayISO()} onChange={(e) => setFecha(e.target.value)} style={fieldStyle} />
          <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (opcional)" style={fieldStyle} />
          <button
            onClick={handleSubmit}
            style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
          >
            🔒 Cerrar ese día
          </button>
        </div>

        {upcomingClosures.length > 0 && (
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {upcomingClosures.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#f8fafc', borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ fontSize: 12, color: '#334155' }}>
                  <strong>{findSedeById(c.sedeId)?.name || c.sedeId}</strong> · {dayLabel(c.fecha)}
                  {c.motivo && <span style={{ color: '#94a3b8' }}> — {c.motivo}</span>}
                </div>
                <button
                  onClick={() => onRemoveClosure(c.id)}
                  style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Reabrir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
