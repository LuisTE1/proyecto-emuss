import AdminHeader from './components/AdminHeader';
import AdminTabs from './components/AdminTabs';
import AnalyticsTab from './components/AnalyticsTab';
import AccessManagementTab from './components/AccessManagementTab';
import AdminPanelModals from './modals/AdminPanelModals';

export default function AdminPanel({ state, actions }) {
  return (
    <div className="emuss-pad" style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 32px 96px' }}>
      <AdminHeader panicActive={state.panicActive} session={state.session} onLogout={actions.logout} />
      <AdminTabs activeTab={state.adminTab} onChange={actions.setAdminTab} />

      {state.adminTab === 'analytics' && <AnalyticsTab state={state} actions={actions} />}
      {state.adminTab === 'accesos' && <AccessManagementTab state={state} actions={actions} />}

      <AdminPanelModals state={state} actions={actions} />
    </div>
  );
}
