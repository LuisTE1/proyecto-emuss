import RangeSelector from './RangeSelector';
import KpiGrid from './KpiGrid';
import SedeBarChart from './SedeBarChart';
import TrendChart from './TrendChart';
import FranjaChart from './FranjaChart';
import ReservationsTable from './ReservationsTable';
import SaturationPanel from './SaturationPanel';
import EmergencyPanel from './EmergencyPanel';
import MaintenancePanel from './MaintenancePanel';
import ActivityLog from './ActivityLog';
import {
  buildBarSede, buildFranjaBars, buildKpis, buildMaintenanceRows, buildRangeOptions,
  buildSaturation, buildTableRows, buildTrend, rangeDaysFor,
} from '../adminSelectors';

export default function AnalyticsTab({ state, actions }) {
  const rangeDays = rangeDaysFor(state.adminRange, state.selectedDate);
  const saturation = buildSaturation(state.selectedDate, state.reservations, state.holds);
  const { kpis, reservasEnRango } = buildKpis(state.adminRange, rangeDays, state.reservations, state.maintenance, state.panicActive, saturation);
  const { trendPoints, trendDots } = buildTrend(rangeDays, state.reservations);
  const table = buildTableRows(state.reservations, state.tableSearch, actions);

  return (
    <>
      <RangeSelector options={buildRangeOptions(state.adminRange, actions)} />
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
          <EmergencyPanel panicActive={state.panicActive} onTogglePanic={actions.togglePanic} />
          <MaintenancePanel rows={buildMaintenanceRows(state.maintenance, actions)} />
        </div>
      </div>

      <ActivityLog logs={state.logs} />
    </>
  );
}
