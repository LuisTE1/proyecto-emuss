import EmergencyPanel from './EmergencyPanel';
import MaintenancePanel from './MaintenancePanel';
import { buildMaintenanceRows } from '../adminSelectors';

export default function MantenimientoTab({ state, actions }) {
  return (
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
  );
}
