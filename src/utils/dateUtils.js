// Fechas reales (formato ISO 'YYYY-MM-DD') en vez del entero "día del mes"
// que asumía Setiembre 2026 fijo — con esto el calendario puede navegar a
// cualquier mes de verdad y "hoy" siempre es el día real del reloj.

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

// Construye un Date a medianoche LOCAL a partir de un ISO 'YYYY-MM-DD' —
// nunca uses `new Date('YYYY-MM-DD')` directo, eso lo interpreta como UTC y
// puede mostrar el día anterior según la zona horaria del navegador.
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayISO() {
  return formatISODate(new Date());
}

export function addDaysISO(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return formatISODate(d);
}

export function addMonthsISO(iso, months) {
  const d = parseISODate(iso);
  d.setMonth(d.getMonth() + months);
  return formatISODate(d);
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Cuántos meses hacia adelante se puede navegar el calendario público desde
// el mes real de hoy (no tiene sentido dejar reservar con años de
// anticipación en una piscina municipal).
export const MAX_MONTHS_AHEAD = 6;

export function dayLabel(iso) {
  const d = parseISODate(iso);
  return `${DOW_SHORT[d.getDay()]} ${pad2(d.getDate())} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

export function selectedDateLabel(iso) {
  const d = parseISODate(iso);
  return `${DOW_NAMES[d.getDay()]} ${pad2(d.getDate())} de ${MONTH_NAMES[d.getMonth()]} del ${d.getFullYear()}`;
}

export function timeToMinutes(range) {
  const [h, m] = range.split(' - ')[0].split(':').map(Number);
  return h * 60 + m;
}

export function isPastDate(iso, todayIso = todayISO()) {
  return iso < todayIso;
}

// ¿Ya pasó (o está empezando) el horario `time` de la fecha `iso`, según la
// hora real del reloj? Si `iso` no es hoy, solo importa si ya pasó la
// fecha completa.
export function isPastSlot(iso, time, now = new Date()) {
  const today = todayISO();
  if (iso < today) return true;
  if (iso > today) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return timeToMinutes(time) <= nowMinutes;
}
