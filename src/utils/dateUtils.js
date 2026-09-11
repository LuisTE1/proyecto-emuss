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

// La demo vive en Setiembre 2026: si la fecha real de hoy cae dentro de ese
// mes, se usa como "hoy" real para bloquear días/horarios ya pasados. Fuera
// de ese mes (antes o después de la demo) no hay una noción de "hoy" válida
// en este calendario de un solo mes, así que no se bloquea nada.
export function isWithinDemoMonth(now = new Date()) {
  return now.getFullYear() === CALENDAR_YEAR && now.getMonth() === CALENDAR_MONTH_INDEX;
}

export function realTodayDay(now = new Date()) {
  return isWithinDemoMonth(now) ? now.getDate() : null;
}

// ¿Ya pasó (o está empezando) el horario `time` del día `day`, según la hora
// real del reloj? Si `day` no es el día real de hoy, solo importa si ya
// pasó la fecha completa.
export function isPastSlot(day, time, now = new Date()) {
  const todayDay = realTodayDay(now);
  if (todayDay == null) return false;
  if (day < todayDay) return true;
  if (day > todayDay) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return timeToMinutes(time) <= nowMinutes;
}
