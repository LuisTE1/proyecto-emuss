// Fecha de referencia simulada para la demo: 10 de setiembre de 2026.
export const TODAY_DAY = 10;
export const CALENDAR_YEAR = 2026;
export const CALENDAR_MONTH_INDEX = 8; // Setiembre (0-indexado)

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
export const DOW_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DOW_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function dateForDay(day) {
  return new Date(CALENDAR_YEAR, CALENDAR_MONTH_INDEX, day);
}

export function dayLabel(day) {
  const dow = DOW_SHORT[dateForDay(day).getDay()];
  return `${dow} ${pad2(day)} Set`;
}

export function selectedDateLabel(day) {
  const dowName = DOW_NAMES[dateForDay(day).getDay()];
  return `${dowName} ${pad2(day)} de ${MONTH_NAMES[CALENDAR_MONTH_INDEX]} del ${CALENDAR_YEAR}`;
}

export function timeToMinutes(range) {
  const [h, m] = range.split(' - ')[0].split(':').map(Number);
  return h * 60 + m;
}
