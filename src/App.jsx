import { useEmussStore } from './hooks/useEmussStore';
import Navbar from './components/layout/Navbar';
import BackendSetupNotice from './components/layout/BackendSetupNotice';
import GlobalErrorBanner from './components/ui/GlobalErrorBanner';
import PublicSite from './features/public-site/PublicSite';
import AdminPanel from './features/admin-panel/AdminPanel';
import ClientAccountView from './features/client-account/ClientAccountView';
import PublicSiteModals from './features/public-site/modals/PublicSiteModals';
import PublicCancelModal from './features/public-site/modals/PublicCancelModal';

export default function App() {
  const { state, actions } = useEmussStore();

  if (!state.backendConfigured) {
    return <BackendSetupNotice />;
  }

  if (state.dataLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14, fontWeight: 600 }}>
        Cargando EMUSS…
      </div>
    );
  }

  return (
    <div className="emuss-scroll" style={{ minHeight: '100vh' }}>
      <GlobalErrorBanner message={state.globalError} onDismiss={actions.dismissGlobalError} />
      <Navbar
        view={state.view}
        session={state.session}
        onGoToAccount={actions.goToAccount}
        onGoToPublic={actions.exitToPublic}
      />
      {state.view === 'public' && <PublicSite state={state} actions={actions} />}
      {state.view === 'account' && <ClientAccountView state={state} actions={actions} />}
      {state.view === 'admin' && <AdminPanel state={state} actions={actions} />}

      <PublicSiteModals state={state} actions={actions} />
      {state.publicCancelModal && (
        <PublicCancelModal
          modal={state.publicCancelModal}
          onSubmit={actions.submitPublicCancel}
          onClose={actions.closePublicCancelModal}
        />
      )}
    </div>
  );
}
