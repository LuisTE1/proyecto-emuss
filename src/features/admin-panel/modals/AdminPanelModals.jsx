import AdminNewReservationModal from './AdminNewReservationModal';
import RbacAddModal from './RbacAddModal';

export default function AdminPanelModals({ state, actions }) {
  return (
    <>
      {state.adminModal === 'new' && <AdminNewReservationModal state={state} actions={actions} />}
      {state.rbacModal === 'add' && <RbacAddModal state={state} actions={actions} />}
    </>
  );
}
