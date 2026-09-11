import RangeSelector from './RangeSelector';
import KpiGrid from './KpiGrid';
import SedeBarChart from './SedeBarChart';
import TrendChart from './TrendChart';
import FranjaChart from './FranjaChart';
import ReservationsTable from './ReservationsTable';
import SaturationPanel from './SaturationPanel';
import EmergencyPanel from './EmergencyPanel';
import MaintenancePanel from './MaintenancePanel';
import { SEDES } from '../../../services/sedesService';
import {
  buildBarSede, buildFranjaBars, buildKpis, buildMaintenanceRows, buildRangeOptions,
  buildSaturation, buildTableRows, buildTrend, rangeDaysFor,
} from '../adminSelectors';

const selectStyle = { padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 12.5, fontWeight: 700, color: '#334155', background: '#ffffff' };

export default function AnalyticsTab({ state, actions }) {
  const isSuperAdmin = state.session?.rol === 'Super Admin';
  const reservationsInScope = isSuperAdmin && state.adminSedeFilter !== 'todas'
    ? state.reservations.filter((r) => r.sedeId === state.adminSedeFilter)
    : state.reservations;

  const rangeDays = rangeDaysFor(state.adminRange, state.selectedDate);
  const saturation = buildSaturation(state.selectedDate, reservationsInScope, state.holds)
    .filter((s) => isSuperAdmin && state.adminSedeFilter !== 'todas' ? s.name === SEDES.find((sd) => sd.id === state.adminSedeFilter)?.name : true);
  const { kpis, reservasEnRango } = buildKpis(state.adminRange, rangeDays, reservationsInScope, state.maintenance, state.panicActive, saturation);
  const { trendPoints, trendDots } = buildTrend(rangeDays, reservationsInScope);
  const table = buildTableRows(reservationsInScope, state.tableSearch, actions);

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

      <ReservationsTable
        rows={table.rows}
        count={table.count}
        search={state.tableSearch}
        onSearchChange={actions.setTableSearch}
        onExport={actions.exportCSV}
        onAddNew={actions.openAdminNew}
      />

      <div className="emuss-2col" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginBottom: 24 }}>
        <SaturationPanel saturation={saturation} />
        <div style={{ display: 'grid', gap: 20 }}>
          <EmergencyPanel
            panicActive={state.panicActive}
            onTogglePanic={actions.togglePanic}
            session={state.session}
            selectedDate={state.selectedDate}
            reservations={state.reservations}
            holds={state.holds}
            onNotifyIncident={actions.notifyIncident}
          />
          <MaintenancePanel
            rows={buildMaintenanceRows(state.maintenance, actions)}
            closures={state.closures}
            session={state.session}
            onAddClosure={actions.addSedeClosure}
            onRemoveClosure={actions.removeSedeClosure}
          />
        </div>
      </div>
    </>
  );
}
