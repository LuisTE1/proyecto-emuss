import { pad2, selectedDateLabel } from '../../utils/dateUtils';
import { OMAPED, SEDES, effectiveSlotState, findSedeById, getSlotTimesForDay } from '../../services/sedesService';
import { priceFor } from '../../services/reservationsService';

const LANE_CAPACITY = 3;
const CALENDAR_DAYS_IN_MONTH = 30;
const CALENDAR_PREV_MONTH_DAYS = 31;
const CALENDAR_FIRST_DOW = new Date(2026, 8, 1).getDay();
const CALENDAR_CELLS = 42;

export function buildFilters(filterDefs, activeFilter, actions) {
  return filterDefs.map((f) => ({
    key: f.key,
    label: f.label,
    active: activeFilter === f.key,
    onClick: () => actions.setActiveFilter(f.key),
  }));
}

export function buildCalendar(selectedDay, calendarOpen, actions) {
  const days = [];
  for (let i = 0; i < CALENDAR_FIRST_DOW; i++) {
    days.push({ num: CALENDAR_PREV_MONTH_DAYS - CALENDAR_FIRST_DOW + 1 + i, selectable: false });
  }
  for (let d = 1; d <= CALENDAR_DAYS_IN_MONTH; d++) {
    days.push({ num: d, selectable: true, selected: d === selectedDay, onClick: () => actions.selectDay(d) });
  }
  const remaining = CALENDAR_CELLS - days.length;
  for (let n = 1; n <= remaining; n++) days.push({ num: n, selectable: false });

  return {
    open: calendarOpen,
    onToggle: actions.toggleCalendar,
    label: selectedDateLabel(selectedDay),
    monthLabel: 'Setiembre 2026',
    days,
  };
}

export function buildFilteredSedes(state, actions) {
  const { activeFilter, slotOccupancy, holds, selectedDay, recommendation } = state;
  return SEDES.filter((sede) => activeFilter === 'todo' || sede.tags.includes(activeFilter)).map((sede) => ({
    id: sede.id,
    name: sede.name,
    address: sede.address,
    recommendation: recommendation && recommendation.fromSede === sede.name ? {
      text: `Este horario está lleno en ${recommendation.fromSede}. ${recommendation.sedeName} tiene ${recommendation.cuposLibres} lugar(es) libre(s) a las ${recommendation.time.split(' - ')[0]}, a ${recommendation.distanceMin} min de aquí.`,
      ctaLabel: `Ver y reservar en ${recommendation.sedeName}`,
      onClick: () => actions.goToAlternative(recommendation.sedeId, recommendation.time, recommendation.day),
    } : null,
    slots: getSlotTimesForDay(sede, selectedDay).map((time) => {
      const eff = effectiveSlotState(sede, selectedDay, time, slotOccupancy, holds);
      const status = eff.status;
      const label = status === 'disponible'
        ? 'Disponible'
        : status === 'reservado'
          ? 'Reservado'
          : status === 'quedan'
            ? `${eff.cuposLibres} de ${LANE_CAPACITY} lugares libres`
            : 'Reservando...';
      return {
        time,
        label,
        status,
        onClick: () => actions.handleSlotClick(sede, time, selectedDay, status, eff.cuposLibres),
        onNotify: () => actions.openNotify(sede.id, sede.name, time, selectedDay),
      };
    }),
  }));
}

export function buildMapSedes() {
  return SEDES.map((sede) => ({
    name: sede.name,
    address: sede.address,
    mapSrc: `https://www.google.com/maps?q=${encodeURIComponent(sede.mapQ)}&output=embed`,
  })).concat([{
    name: OMAPED.name,
    address: OMAPED.address,
    mapSrc: `https://www.google.com/maps?q=${encodeURIComponent(OMAPED.mapQ)}&output=embed`,
  }]);
}

export function buildCountdownLabel(countdownSeconds) {
  const mm = pad2(Math.floor(countdownSeconds / 60));
  const ss = pad2(countdownSeconds % 60);
  return `${mm}:${ss}`;
}

export function buildPersonaOptions(activeCupos) {
  const options = [];
  for (let i = 1; i <= activeCupos; i++) options.push(i);
  return options;
}

// Resume las necesidades de accesibilidad marcadas en el formulario, para
// mostrarlas en el resumen del carrito y confirmar que quedaron registradas.
export function buildAccessibilityLabel(form) {
  const items = [];
  if (form.necesitaElevador) items.push('Elevador hidráulico');
  if (form.necesitaRampa) items.push('Rampa / silla de ruedas');
  if (form.necesitaAsistencia) items.push('Apoyo auditivo o visual');
  if (form.vaConCuidador) items.push('Con cuidador/asistente');
  return items.join(', ');
}

// Datos derivados del modal activo (formulario / carrito / ticket): sede,
// tarifas y precio total, según la reserva que el usuario está armando.
export function buildModalPricing(state) {
  const m = state.modal;
  const sede = m ? findSedeById(m.sedeId) : null;
  const tariff = sede ? sede.tariff : { vecino: 0, regular: 0 };
  const f = state.form;
  const rate = f.tarifa === 'vecino' ? tariff.vecino : tariff.regular;
  const totalPrecio = sede ? priceFor(sede, f.tarifa, f.personas, f.exclusivo) : 0;

  return {
    modalSedeName: m ? m.sedeName : '',
    modalSlotTime: m ? m.slotTime : '',
    rateLabel: f.tarifa === 'vecino' ? 'Vecino Surco' : 'Público general',
    ratePrice: `S/${rate}`,
    totalPrecio: `S/${totalPrecio}`,
    tarifaVecino: `S/${tariff.vecino}`,
    tarifaRegular: `S/${tariff.regular}`,
  };
}
