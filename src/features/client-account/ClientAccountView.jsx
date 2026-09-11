import LoginCard from './components/LoginCard';
import ClientAccountPage from './ClientAccountPage';

export default function ClientAccountView({ state, actions }) {
  if (!state.session) {
    return (
      <LoginCard
        mode={state.authMode}
        form={state.authForm}
        error={state.authError}
        loading={state.authLoading}
        onChangeMode={actions.setAuthMode}
        onChangeField={actions.setAuthField}
        onSubmit={state.authMode === 'register' ? actions.submitRegister : actions.submitLogin}
      />
    );
  }

  return (
    <ClientAccountPage
      session={state.session}
      reservations={state.reservations}
      actions={actions}
      onLogout={actions.logout}
      onGoToDisponibilidad={actions.exitToPublic}
    />
  );
}
