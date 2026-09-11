import { addDaysISO, dayLabel, daysInMonth, pad2, parseISODate } from '../../utils/dateUtils';
import { LANE_CAPACITY, SEDES, effectiveSlotState, findSedeById, getSlotTimesForDay } from '../../services/sedesService';
import { filterReservationsBySearch } from '../../services/reservationsService';

const RANGE_DEFS = [
  { key: 'dia', label: 'Día' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mes' },
];

export function buildRangeOptions(adminRange, actions) {
  return RANGE_DEFS.map((ro) => ({
    key: ro.key,
    label: ro.label,
    active: adminRange === ro.key,
    onClick: () => actions.setAdminRange(ro.key),
  }));
}

// Devuelve las fechas reales (ISO) del rango elegido, centradas en la fecha
// seleccionada — "semana" son los ±3 días reales alrededor, "mes" es el mes
// calendario real de esa fecha (28-31 días según corresponda).
export function rangeDaysFor(adminRange, selectedDate) {
  if (adminRange === 'dia') return [selectedDate];
  if (adminRange === 'semana') {
    const days = [];
    for (let d = -3; d <= 3; d++) days.push(addDaysISO(selectedDate, d));
    return days;
  }
  const ref = parseISODate(selectedDate);
  const numDays = daysInMonth(ref.getFullYear(), ref.getMonth());
  const days = [];
  for (let day = 1; day <= numDays; day++) {
    days.push(`${ref.getFullYear()}-${pad2(ref.getMonth() + 1)}-${pad2(day)}`);
  }
  return days;
}

function satColor(pct) {
  if (pct >= 70) return '#dc2626';
  if (pct >= 40) return '#d97706';
  return '#059669';
}

export function buildSaturation(selectedDate, reservations, holds = []) {
  return SEDES.map((sede) => {
    const times = getSlotTimesForDay(sede, selectedDate);
    let sum = 0;
    times.forEach((t) => {
      const eff = effectiveSlotState(sede, selectedDate, t, reservations, holds);
      sum += eff.exclusive ? LANE_CAPACITY : eff.occupancy;
    });
    const pct = times.length ? Math.round((sum / (times.length * LANE_CAPACITY)) * 100) : 0;
    const color = satColor(pct);
    return { name: sede.name, pct, color };
  });
}

export function buildKpis(adminRange, rangeDays, reservations, maintenance, panicActive, saturation) {
  const reservasEnRango = reservations.filter((r) => r.estado === 'confirmada' && rangeDays.includes(r.fecha));
  const totalReservasRango = reservasEnRango.length;
  const ingresosRango = reservasEnRango.reduce((a, r) => a + r.precio, 0);
  const incidenciasActivas = Object.values(maintenance).filter(Boolean).length + (panicActive ? 1 : 0);
  const avgOcupacion = saturation.length ? Math.round(saturation.reduce((a, s) => a + s.pct, 0) / saturation.length) : 0;
  const rangeLabel = adminRange === 'dia' ? 'día' : adminRange === 'semana' ? 'semana' : 'mes';

  return {
    kpis: [
      { label: `Reservas (${rangeLabel})`, value: String(totalReservasRango), trend: `${rangeDays.length} día(s) en el rango`, trendColor: '#059669' },
      { label: 'Ocupación promedio (hoy)', value: `${avgOcupacion}%`, trend: avgOcupacion > 50 ? 'Alta demanda' : 'Estable', trendColor: avgOcupacion > 50 ? '#dc2626' : '#059669' },
      { label: 'Ingresos estimados', value: `S/${ingresosRango}`, trend: 'Reservas confirmadas en el rango', trendColor: '#4f46e5' },
      { label: 'Incidencias activas', value: String(incidenciasActivas), trend: 'Mantenimiento + pánico', trendColor: incidenciasActivas > 0 ? '#dc2626' : '#64748b' },
    ],
    reservasEnRango,
  };
}

export function buildBarSede(reservasEnRango) {
  const maxSedeCount = Math.max(1, ...SEDES.map((sede) => reservasEnRango.filter((r) => r.sedeId === sede.id).length));
  return SEDES.map((sede) => {
    const count = reservasEnRango.filter((r) => r.sedeId === sede.id).length;
    return { name: sede.name.replace('Sede ', ''), count, heightPx: Math.max(6, Math.round((count / maxSedeCount) * 120)) };
  });
}

export function buildTrend(rangeDays, reservations) {
  const trendDayList = rangeDays.length <= 12 ? rangeDays : rangeDays.filter((_, i) => i % Math.ceil(rangeDays.length / 12) === 0);
  const trendCounts = trendDayList.map((d) => reservations.filter((r) => r.estado === 'confirmada' && r.fecha === d).length);
  const maxTrend = Math.max(1, ...trendCounts);
  const chartW = 300, chartH = 140, padX = 12, padY = 14;
  const stepX = trendDayList.length > 1 ? (chartW - padX * 2) / (trendDayList.length - 1) : 0;
  const trendDots = trendDayList.map((d, i) => {
    const x = padX + stepX * i;
    const y = chartH - padY - (trendCounts[i] / maxTrend) * (chartH - padY * 2);
    return { x: Math.round(x), y: Math.round(y), label: dayLabel(d), count: trendCounts[i] };
  });
  const trendPoints = trendDots.map((pt) => `${pt.x},${pt.y}`).join(' ');
  return { trendDots, trendPoints };
}

export function buildFranjaBars(reservasEnRango) {
  const franjaMap = {};
  reservasEnRango.forEach((r) => {
    const h = r.time.split(' - ')[0];
    franjaMap[h] = (franjaMap[h] || 0) + r.personas;
  });
  const franjaHours = Object.keys(franjaMap).sort();
  const maxFranja = Math.max(1, ...franjaHours.map((h) => franjaMap[h]));
  return franjaHours.map((h) => ({
    hour: h,
    count: franjaMap[h],
    heightPx: Math.max(6, Math.round((franjaMap[h] / maxFranja) * 100)),
  }));
}

function accessibilityNote(r) {
  const items = [];
  if (r.necesitaElevador) items.push('Elevador hidráulico');
  if (r.necesitaRampa) items.push('Rampa / silla de ruedas');
  if (r.necesitaAsistencia) items.push('Apoyo auditivo o visual');
  if (r.vaConCuidador) items.push('Con cuidador/asistente');
  return items.join(', ');
}

export function buildTableRows(reservations, search, actions) {
  const rowsRaw = filterReservationsBySearch(reservations, search);
  const rows = rowsRaw.map((r) => {
    const sede = findSedeById(r.sedeId);
    return {
      code: r.code, nombre: r.nombre, dni: r.dni, sedeName: sede ? sede.name : r.sedeId,
      fecha: dayLabel(r.fecha), time: r.time, personas: r.personas,
      estadoLabel: r.estado === 'confirmada' ? 'Confirmada' : 'Cancelada',
      confirmed: r.estado === 'confirmada',
      cancelable: r.estado === 'confirmada',
      onCancel: () => actions.cancelReservaByCode(r.code),
      accessibilityNote: accessibilityNote(r),
    };
  });
  return { rows, count: rowsRaw.length };
}

export function buildMaintenanceRows(maintenance, actions) {
  return SEDES.map((sede) => {
    const on = !!maintenance[sede.id];
    return {
      id: sede.id,
      name: sede.name,
      on,
      label: on ? 'En mantenimiento' : 'Operativa',
      onClick: () => actions.toggleMaintenance(sede.id),
    };
  });
}

export function buildSedeSelectOptions() {
  return SEDES.map((s) => ({ id: s.id, name: s.name }));
}

export function buildRbacRows(rbacUsers, actions) {
  return rbacUsers.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.rol,
    sedeId: u.sedeId || '',
    sedeDisabled: u.rol === 'Super Admin',
    onRolChange: (rol) => actions.updateRbacRol(u.id, rol),
    onSedeChange: (sedeId) => actions.updateRbacSede(u.id, sedeId),
  }));
}

export function buildAdminTimeOptions(adminForm, selectedDate, reservations, holds = []) {
  const sede = findSedeById(adminForm.sedeId) || SEDES[0];
  const times = getSlotTimesForDay(sede, selectedDate);
  const timeOptions = times.map((t) => {
    const eff = effectiveSlotState(sede, selectedDate, t, reservations, holds);
    return { time: t, label: `${t} (${eff.cuposLibres} cupos)` };
  });
  const currentEff = adminForm.time ? effectiveSlotState(sede, selectedDate, adminForm.time, reservations, holds) : { cuposLibres: LANE_CAPACITY };
  const personaOptions = [];
  for (let i = 1; i <= Math.max(1, currentEff.cuposLibres); i++) personaOptions.push(i);
  return { timeOptions, personaOptions };
}
