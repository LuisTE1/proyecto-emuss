import ReservationsTable from './ReservationsTable';
import { buildTableRows } from '../adminSelectors';

export default function ReservasTab({ state, actions }) {
  const isSuperAdmin = state.session?.rol === 'Super Admin';
  const reservationsInScope = isSuperAdmin && state.adminSedeFilter !== 'todas'
    ? state.reservations.filter((r) => r.sedeId === state.adminSedeFilter)
    : state.reservations;

  const table = buildTableRows(reservationsInScope, state.tableSearch, actions);

  return (
    <ReservationsTable
      rows={table.rows}
      count={table.count}
      search={state.tableSearch}
      onSearchChange={actions.setTableSearch}
      onExport={actions.exportCSV}
      onAddNew={actions.openAdminNew}
    />
  );
}
