import { MAX_MONTHS_AHEAD, MONTH_NAMES, daysInMonth, isPastSlot, pad2, selectedDateLabel, todayISO } from '../../utils/dateUtils';
import { OMAPED, SEDES, directionsUrlFor, effectiveSlotState, findSedeById, getSlotTimesForDay } from '../../services/sedesService';
import { priceFor } from '../../services/reservationsService';

const LANE_CAPACITY = 3;

export function buildFilters(filterDefs, activeFilter, actions) {
  return filterDefs.map((f) => ({
    key: f.key,
    label: f.label,
    active: activeFilter === f.key,
    onClick: () => actions.setActiveFilter(f.key),
  }));
}

// Calendario de un mes real navegable (no más Setiembre 2026 fijo): arma la
// grilla del mes que se está viendo (calendarViewYear/Month), marca
// seleccionable solo hoy en adelante, y habilita/deshabilita los botones
// ‹ › según el rango real permitido (no se puede ir a meses pasados, ni
// más de MAX_MONTHS_AHEAD hacia adelante).
export function buildCalendar(state, actions) {
  const { selectedDate, calendarOpen, calendarViewYear: y, calendarViewMonth: m } = state;
  const today = todayISO();
  const firstDow = new Date(y, m, 1).getDay();
  const numDays = daysInMonth(y, m);
  const prevMonthDays = daysInMonth(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1);

  const days = [];
  for (let i = 0; i < firstDow; i++) {
    days.push({ num: prevMonthDays - firstDow + 1 + i, selectable: false });
  }
  for (let d = 1; d <= numDays; d++) {
    const iso = `${y}-${pad2(m + 1)}-${pad2(d)}`;
    const selectable = iso >= today;
    days.push({ num: d, selectable, selected: iso === selectedDate, onClick: selectable ? () => actions.selectDate(iso) : undefined });
  }
  const totalCells = Math.ceil((firstDow + numDays) / 7) * 7;
  const remaining = totalCells - days.length;
  for (let n = 1; n <= remaining; n++) days.push({ num: n, selectable: false });

  const now = new Date();
  const canGoPrev = y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth());
  const maxDate = new Date(now.getFullYear(), now.getMonth() + MAX_MONTHS_AHEAD, 1);
  const canGoNext = y < maxDate.getFullYear() || (y === maxDate.getFullYear() && m < maxDate.getMonth());

  return {
    open: calendarOpen,
    onToggle: actions.toggleCalendar,
    label: selectedDateLabel(selectedDate),
    monthLabel: `${MONTH_NAMES[m]} ${y}`,
    days,
    onPrevMonth: actions.calendarPrevMonth,
    onNextMonth: actions.calendarNextMonth,
    canGoPrev,
    canGoNext,
  };
}

export function buildFilteredSedes(state, actions) {
  const { activeFilter, slotOccupancy, holds, selectedDate, recommendation } = state;
  return SEDES.filter((sede) => activeFilter === 'todo' || sede.tags.includes(activeFilter)).map((sede) => ({
    id: sede.id,
    name: sede.name,
    address: sede.address,
    directionsUrl: directionsUrlFor(sede),
    recommendation: recommendation && recommendation.fromSede === sede.name ? {
      text: `Este horario está lleno en ${recommendation.fromSede}. ${recommendation.sedeName} tiene ${recommendation.cuposLibres} lugar(es) libre(s) a las ${recommendation.time.split(' - ')[0]}, a ${recommendation.distanceMin} min de aquí.`,
      ctaLabel: `Ver y reservar en ${recommendation.sedeName}`,
      onClick: () => actions.goToAlternative(recommendation.sedeId, recommendation.time, recommendation.fecha),
    } : null,
    slots: getSlotTimesForDay(sede, selectedDate).map((time) => {
      const past = isPastSlot(selectedDate, time);
      const eff = effectiveSlotState(sede, selectedDate, time, slotOccupancy, holds);
      const status = past ? 'pasado' : eff.status;
      const label = status === 'pasado'
        ? 'Horario pasado'
        : status === 'disponible'
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
        onClick: status === 'pasado' ? undefined : () => actions.handleSlotClick(sede, time, selectedDate, status, eff.cuposLibres),
        onNotify: () => actions.openNotify(sede.id, sede.name, time, selectedDate),
      };
    }),
  }));
}

export function buildMapSedes() {
  return SEDES.map((sede) => ({
    name: sede.name,
    address: sede.address,
    mapSrc: `https://www.google.com/maps?q=${encodeURIComponent(sede.mapQ)}&output=embed`,
    directionsUrl: directionsUrlFor(sede),
  })).concat([{
    name: OMAPED.name,
    address: OMAPED.address,
    mapSrc: `https://www.google.com/maps?q=${encodeURIComponent(OMAPED.mapQ)}&output=embed`,
    directionsUrl: directionsUrlFor(OMAPED),
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

export const PAYMENT_METHODS = [
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
];

export function paymentMethodLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || value;
}

// Valida el formulario de reserva antes de dejar pasar al carrito: nombre,
// documento (DNI a 8 dígitos exactos), teléfono (9 dígitos) y correo son
// obligatorios, y si viene con acompañantes cada uno necesita su nombre —
// de lo contrario la reserva queda con gente sin identificar.
export function validateReservationForm(form) {
  if (!form.nombres.trim() || !form.apellidoPaterno.trim()) return 'Ingresa tus nombres y apellido paterno.';
  if (!form.documento.trim()) return 'Ingresa tu número de documento.';
  if (form.tipoDocumento === 'DNI' && !/^\d{8}$/.test(form.documento.trim())) return 'El DNI debe tener 8 dígitos.';
  if (!/^\d{9}$/.test(form.telefono.trim())) return 'Ingresa un teléfono válido de 9 dígitos.';
  if (!/^\S+@\S+\.\S+$/.test(form.correo.trim())) return 'Ingresa un correo electrónico válido.';
  if (!form.exclusivo && form.personas > 1) {
    const faltante = (form.acompanantes || []).slice(0, form.personas - 1).some((a) => !a || !a.trim());
    if (faltante || (form.acompanantes || []).length < form.personas - 1) {
      return 'Ingresa el nombre de cada acompañante que va contigo.';
    }
  }
  return null;
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
