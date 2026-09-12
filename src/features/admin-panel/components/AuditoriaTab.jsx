import { panelShell, td, th } from '../adminStyles';

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AuditoriaTab({ state }) {
  return (
    <div style={panelShell}>
      <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 4 }}>Auditoría</div>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: '#94a3b8' }}>Registro de actividad del sistema, más reciente primero.</p>
      <div className="emuss-table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <th style={th}>Fecha y hora</th>
              <th style={th}>Evento</th>
            </tr>
          </thead>
          <tbody>
            {state.auditLog.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ ...td, color: '#94a3b8' }}>{formatTimestamp(entry.created_at)}</td>
                <td style={td}>{entry.text}</td>
              </tr>
            ))}
            {state.auditLog.length === 0 && (
              <tr><td style={{ ...td, color: '#94a3b8' }} colSpan={2}>Todavía no hay actividad registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
