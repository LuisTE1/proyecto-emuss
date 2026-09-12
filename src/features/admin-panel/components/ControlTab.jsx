import { SEDES, STATUS_STYLE, effectiveSlotState, getSlotTimesForDay, isSedeClosed } from '../../../services/sedesService';
import { panelShell } from '../adminStyles';

const STATUS_LABEL = {
  disponible: 'Disponible', quedan: 'Quedan cupos', reservado: 'Lleno',
  enreserva: 'En proceso', pasado: 'Pasado', cerrado: 'Cerrado',
};

// Vista operativa de disponibilidad: no hay carriles individuales en el
// modelo de datos (la capacidad es un cupo total de 3 personas por
// sede+horario, ver LANE_CAPACITY/effectiveSlotState) — así que en vez de
// inventar columnas de "carril 1..8" que no existirían de verdad, esto
// muestra el estado real de cada horario del día, por sede.
export default function ControlTab({ state, actions }) {
  const isSuperAdmin = state.session?.rol === 'Super Admin';
  const sedesInScope = isSuperAdmin
    ? (state.adminSedeFilter !== 'todas' ? SEDES.filter((s) => s.id === state.adminSedeFilter) : SEDES)
    : SEDES.filter((s) => s.id === state.session?.sedeId);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ ...panelShell, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Fecha</label>
        <input
          type="date" value={state.selectedDate}
          onChange={(e) => actions.selectDate(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13 }}
        />
      </div>

      {sedesInScope.map((sede) => {
        const closed = isSedeClosed(sede.id, state.selectedDate, state.closures);
        const times = getSlotTimesForDay(sede, state.selectedDate);
        return (
          <div key={sede.id} style={panelShell}>
            <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0f172a', marginBottom: 14 }}>{sede.name}</div>
            {closed ? (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Esta sede está cerrada en la fecha elegida.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
                {times.map((t) => {
                  const eff = effectiveSlotState(sede, state.selectedDate, t, state.reservations, state.holds);
                  const st = STATUS_STYLE[eff.status];
                  return (
                    <div
                      key={t}
                      style={{ border: `1px solid ${st.border}`, background: st.bg, borderRadius: 12, padding: '10px 12px' }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>{t}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: st.color, marginTop: 4 }}>
                        {st.icon} {STATUS_LABEL[eff.status]} · {eff.occupancy}/3
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
