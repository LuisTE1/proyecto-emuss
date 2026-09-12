import RangeSelector from './RangeSelector';
import KpiGrid from './KpiGrid';
import SedeBarChart from './SedeBarChart';
import TrendChart from './TrendChart';
import FranjaChart from './FranjaChart';
import SaturationPanel from './SaturationPanel';
import { SEDES } from '../../../services/sedesService';
import {
  buildBarSede, buildFranjaBars, buildKpis, buildRangeOptions, buildSaturation, buildTrend, rangeDaysFor,
} from '../adminSelectors';

const selectStyle = { padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 12.5, fontWeight: 700, color: '#334155', background: '#ffffff' };

// "Resumen" y "Reportes" comparten los mismos datos/gráficos — Reportes
// solo agrega la comparación de saturación por sede debajo, para un
// vistazo más completo cuando alguien quiere exportar/analizar.
export default function ResumenTab({ state, actions, reports = false }) {
  const isSuperAdmin = state.session?.rol === 'Super Admin';
  const reservationsInScope = isSuperAdmin && state.adminSedeFilter !== 'todas'
    ? state.reservations.filter((r) => r.sedeId === state.adminSedeFilter)
    : state.reservations;

  const rangeDays = rangeDaysFor(state.adminRange, state.selectedDate);
  const saturation = buildSaturation(state.selectedDate, reservationsInScope, state.holds)
    .filter((s) => isSuperAdmin && state.adminSedeFilter !== 'todas' ? s.name === SEDES.find((sd) => sd.id === state.adminSedeFilter)?.name : true);
  const { kpis, reservasEnRango } = buildKpis(state.adminRange, rangeDays, reservationsInScope, state.maintenance, state.panicActive, saturation);
  const { trendPoints, trendDots } = buildTrend(rangeDays, reservationsInScope);

  return (
    <>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
        <RangeSelector options={buildRangeOptions(state.adminRange, actions)} />
        {isSuperAdmin && (
          <select value={state.adminSedeFilter} onChange={(e) => actions.setAdminSedeFilter(e.target.value)} style={selectStyle}>
            <option value="todas">Todas las sedes</option>
            {SEDES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>
      <KpiGrid kpis={kpis} />

      <div className="emuss-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <SedeBarChart bars={buildBarSede(reservasEnRango)} />
        <TrendChart trendPoints={trendPoints} trendDots={trendDots} />
      </div>

      <FranjaChart bars={buildFranjaBars(reservasEnRango)} />

      {reports && <SaturationPanel saturation={saturation} />}
    </>
  );
}
