const th = { padding: '10px 8px', fontSize: 12, color: '#94a3b8', fontWeight: 700 };
const td = { padding: '10px 8px', fontSize: 13, color: '#334155', whiteSpace: 'nowrap' };

export default function ReservationsTable({ rows, count, search, onSearchChange, onExport, onAddNew }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.04)', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a' }}>Reservas ({count})</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por código, nombre o DNI"
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13.5, minWidth: 220 }}
          />
          <button onClick={onExport} style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>⬇ Exportar a Excel</button>
          <button onClick={onAddNew} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Nueva reserva</button>
        </div>
      </div>
      <div className="emuss-table-wrap">
        <table>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
              <th style={th}>Código</th>
              <th style={th}>Nombre</th>
              <th style={th}>DNI</th>
              <th style={th}></th>
              <th style={th}>Sede</th>
              <th style={th}>Fecha</th>
              <th style={th}>Hora</th>
              <th style={th}>Personas</th>
              <th style={th}>Estado</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ ...td, fontWeight: 700 }}>{row.code}</td>
                <td style={td}>{row.nombre}</td>
                <td style={td}>{row.dni}</td>
                <td style={{ padding: '10px 8px', fontSize: 15 }}>
                  {row.accessibilityNote && <span title={row.accessibilityNote}>♿</span>}
                </td>
                <td style={td}>{row.sedeName}</td>
                <td style={td}>{row.fecha}</td>
                <td style={td}>{row.time}</td>
                <td style={{ ...td, whiteSpace: 'normal' }}>{row.personas}</td>
                <td style={{ padding: '10px 8px', fontSize: 12.5 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontWeight: 700, background: row.confirmed ? '#ecfdf5' : '#fdf2f4', color: row.confirmed ? '#047857' : '#9d5570' }}>
                    {row.estadoLabel}
                  </span>
                </td>
                <td style={{ padding: '10px 8px' }}>
                  {row.cancelable && (
                    <button onClick={row.onCancel} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: 11.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
