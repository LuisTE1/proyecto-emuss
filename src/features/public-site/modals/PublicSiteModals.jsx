import { buildAccessibilityItems, buildCountdownLabel, buildModalPricing, buildPersonaOptions, paymentMethodLabel } from '../publicSiteSelectors';
import QueueModal from './QueueModal';
import NotifyModal from './NotifyModal';
import ReservationFormModal from './ReservationFormModal';
import CartModal from './CartModal';
import TicketModal from './TicketModal';
import { dayLabel } from '../../../utils/dateUtils';

export default function PublicSiteModals({ state, actions }) {
  const { modal, notifyModal } = state;
  const pricing = buildModalPricing(state);

  return (
    <>
      {modal && modal.type === 'queue-info' && (
        <QueueModal
          sedeName={pricing.modalSedeName}
          slotTime={pricing.modalSlotTime}
          waitingCount={state.queueWaitingCount}
          countdownLabel={buildCountdownLabel(state.queueCountdown)}
          onClose={actions.closeModal}
          onJoinQueue={actions.joinQueue}
        />
      )}

      {modal && modal.type === 'form' && (
        <ReservationFormModal
          sedeName={pricing.modalSedeName}
          slotTime={pricing.modalSlotTime}
          countdownLabel={buildCountdownLabel(state.countdown)}
          totalPrecio={pricing.totalPrecio}
          isPrefilled={state.session?.type === 'client'}
          formError={state.formError}
          form={state.form}
          personaOptions={buildPersonaOptions(state.activeCupos)}
          onChangeField={actions.setFormField}
          onChangeAcompanante={actions.setAcompanante}
          onCancel={actions.closeModal}
          onSubmit={actions.goToCart}
        />
      )}

      {modal && modal.type === 'cart' && (
        <CartModal
          sedeName={pricing.modalSedeName}
          slotTime={pricing.modalSlotTime}
          personas={state.form.personas}
          rateLabel={pricing.rateLabel}
          ratePrice={pricing.ratePrice}
          totalPrecio={pricing.totalPrecio}
          countdownLabel={buildCountdownLabel(state.countdown)}
          accesibilidadItems={buildAccessibilityItems(state.form)}
          notasAccesibilidad={state.form.notasAccesibilidad}
          metodoPagoLabel={paymentMethodLabel(state.form.metodoPago)}
          acompanantesLabel={!state.form.exclusivo ? (state.form.acompanantes || []).filter(Boolean).join(', ') : ''}
          contactoEmergencia={state.form.contactoEmergencia}
          confirming={state.confirming}
          onBack={actions.backToForm}
          onConfirm={actions.confirmReserva}
        />
      )}

      {modal && modal.type === 'ticket' && (
        <TicketModal
          ticket={state.lastTicket || {}}
          sedeName={pricing.modalSedeName}
          dateLabel={modal.fecha ? dayLabel(modal.fecha) : ''}
          slotTime={pricing.modalSlotTime}
          onClose={actions.closeModal}
          onCancelReserva={actions.cancelReserva}
        />
      )}

      {notifyModal && (
        <NotifyModal
          confirmed={state.notifyConfirmed}
          sedeName={notifyModal.sedeName}
          slotTime={notifyModal.time}
          contact={state.notifyForm.contact}
          onChangeContact={actions.setNotifyContact}
          onClose={actions.closeNotify}
          onSubmit={actions.submitNotify}
        />
      )}
    </>
  );
}
