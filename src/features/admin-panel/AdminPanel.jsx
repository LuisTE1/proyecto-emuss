import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import ResumenTab from './components/ResumenTab';
import ReservasTab from './components/ReservasTab';
import CheckinTab from './components/CheckinTab';
import ControlTab from './components/ControlTab';
import MantenimientoTab from './components/MantenimientoTab';
import ClientesTab from './components/ClientesTab';
import AuditoriaTab from './components/AuditoriaTab';
import AccessManagementTab from './components/AccessManagementTab';
import AdminPanelModals from './modals/AdminPanelModals';

export default function AdminPanel({ state, actions }) {
  const section = state.adminTab || 'resumen';

  return (
    <div className="emuss-pad" style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 32px 96px' }}>
      <AdminHeader panicActive={state.panicActive} session={state.session} onLogout={actions.logout} />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <AdminSidebar active={section} onChange={actions.setAdminTab} session={state.session} onLogout={actions.logout} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {section === 'resumen' && <ResumenTab state={state} actions={actions} />}
          {section === 'reservas' && <ReservasTab state={state} actions={actions} />}
          {section === 'checkin' && <CheckinTab state={state} actions={actions} />}
          {section === 'control' && <ControlTab state={state} actions={actions} />}
          {section === 'mantenimiento' && <MantenimientoTab state={state} actions={actions} />}
          {section === 'reportes' && <ResumenTab state={state} actions={actions} reports />}
          {section === 'clientes' && <ClientesTab state={state} actions={actions} />}
          {section === 'accesos' && <AccessManagementTab state={state} actions={actions} />}
          {section === 'auditoria' && <AuditoriaTab state={state} actions={actions} />}
        </div>
      </div>

      <AdminPanelModals state={state} actions={actions} />
    </div>
  );
}
