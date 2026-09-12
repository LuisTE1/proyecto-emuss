import { useState } from 'react';
import { panelShell, td, th } from '../adminStyles';
import { buildClientesRows } from '../adminSelectors';

export default function ClientesTab({ state }) {
  const [search, setSearch] = useState('');
  const isSuperAdmin = state.session?.rol === 'Super Admin';
  const reservationsInScope = isSuperAdmin && state.adminSedeFilter !== 'todas'
    ? state.reservations.filter((r) => r.sedeId === state.adminSedeFilter)
    : state.reservations;
  const rows = buildClientesRows(reservationsInScope, search);

  return (
    <div style={panelShell}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a' }}>Clientes</div>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre, DNI o correo"
          style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, minWidth: 220 }}
        />
      </div>
      <div className="emuss-table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <th style={th}>Cliente</th>
              <th style={th}>Reservas</th>
              <th style={th}>Asistencias</th>
              <th style={th}>Cancelaciones</th>
              <th style={th}>No-show</th>
              <th style={th}>Última reserva</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={`${c.dni}|${c.correo}`} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.nombre}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{c.correo || c.dni}</div>
                </td>
                <td style={td}>{c.reservas}</td>
                <td style={td}>{c.asistencias}</td>
                <td style={td}>{c.cancelaciones}</td>
                <td style={td}>{c.noShows}</td>
                <td style={td}>{c.ultimaLabel}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td style={{ ...td, color: '#94a3b8' }} colSpan={6}>No hay clientes que coincidan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
