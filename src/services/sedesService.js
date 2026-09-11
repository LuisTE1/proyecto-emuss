import { pad2, timeToMinutes } from '../utils/dateUtils';

export const LANE_CAPACITY = 3;

export const SEDES = [
  { id: 'chacarilla', name: 'Sede Chacarilla', tags: ['adultos', 'accesible'], address: 'Jirón Montemar 190, Urb. Chacarilla del Estanque, Surco', mapQ: 'Complejo Deportivo Chacarilla, Surco, Peru', distanceMin: 0, tariff: { vecino: 35, regular: 70 }, dynamic: true },
  { id: 'ferrero', name: 'Sede Ferrero', tags: ['adultos'], address: 'Av. Raúl Ferrero Nº 155, Surco', mapQ: 'Coliseo Ferrero, Surco, Peru', distanceMin: 12, tariff: { vecino: 20, regular: 40 }, dynamic: true },
  { id: 'montjoy', name: 'Sede Montjoy', tags: ['infantil', 'adultos'], address: 'Jirón Arica 581, Surco', mapQ: 'Coliseo Julio Montjoy, Surco, Peru', distanceMin: 18, tariff: { vecino: 30, regular: 60 }, dynamic: false, slotTimes: ['07:00 - 08:00', '08:00 - 09:00', '18:00 - 19:00'] },
];

export const OMAPED = {
  name: 'OMAPED Loma Amarilla',
  address: 'Av. Monte de los Olivos 679, Parque Ecológico Loma Amarilla, Surco',
  mapQ: 'Parque Ecológico Loma Amarilla, Surco, Peru',
  note: 'Piscina terapéutica y temperada (15×8 m) orientada a personas con discapacidad, con clases de natación adaptadas y terapia física.',
};

export const FILTER_DEFS = [
  { key: 'todo', label: '🌐 Ver Todo' },
  { key: 'infantil', label: '👶 Zona Infantil' },
  { key: 'adultos', label: '🏊 Carril Adultos' },
  { key: 'accesible', label: '♿ Accesible Motriz' },
];

export const STATUS_STYLE = {
  disponible: { bg: 'rgba(236,253,245,0.6)', border: '#a7f3d0', color: '#047857', icon: '✅' },
  quedan: { bg: 'rgba(236,253,245,0.6)', border: '#a7f3d0', color: '#047857', icon: '✅' },
  reservado: { bg: '#fdf2f4', border: '#fbcfe0', color: '#9d5570', icon: '⛔' },
  enreserva: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '⏳' },
};

export function findSedeById(sedeId) {
  return SEDES.find((s) => s.id === sedeId);
}

export function blocksForDow(dow) {
  if (dow === 0) return [[5, 13]];
  if (dow === 6) return [[5, 8], [13, 18]];
  if (dow === 2 || dow === 4) return [[5, 8], [13, 15], [19, 22]];
  return [[5, 8], [12, 14], [19, 22]];
}

export function slotsFromBlocks(blocks) {
  const out = [];
  blocks.forEach((b) => {
    for (let h = b[0]; h < b[1]; h++) out.push(`${pad2(h)}:00 - ${pad2(h + 1)}:00`);
  });
  return out;
}

export function getSlotTimesForDay(sede, day) {
  if (sede.dynamic) return slotsFromBlocks(blocksForDow(new Date(2026, 8, day).getDay()));
  return sede.slotTimes;
}

// Calcula el estado real de un carril combinando las reservas confirmadas
// con los holds activos (gente reservando ese horario ahora mismo, ver
// holdsService) — ambos llegan por Realtime, así que esto se recalcula solo
// apenas cambia algo en cualquier pestaña conectada.
export function effectiveSlotState(sede, day, time, reservations, holds = []) {
  const key = `${sede.id}|${day}|${time}`;
  const matching = reservations.filter(
    (r) => r.estado === 'confirmada' && r.sedeId === sede.id && r.day === day && r.time === time
  );
  const exclusive = matching.some((r) => r.exclusivo);
  const occupancy = exclusive ? LANE_CAPACITY : matching.reduce((a, r) => a + r.personas, 0);

  const now = Date.now();
  const activeHolds = holds.filter(
    (h) => h.sedeId === sede.id && h.day === day && h.time === time && new Date(h.expiresAt).getTime() > now
  );
  const holdExclusive = activeHolds.some((h) => h.exclusivo);
  const holdOccupancy = activeHolds.reduce((a, h) => a + h.personas, 0);

  const isFull = exclusive || occupancy >= LANE_CAPACITY;
  const totalOccupancy = exclusive ? LANE_CAPACITY : Math.min(LANE_CAPACITY, occupancy + holdOccupancy);
  const cuposLibres = isFull ? 0 : Math.max(0, LANE_CAPACITY - totalOccupancy);

  let status;
  if (isFull) status = 'reservado';
  else if (holdExclusive || holdOccupancy > 0) status = 'enreserva';
  else if (occupancy > 0) status = 'quedan';
  else status = 'disponible';

  return { status, occupancy: totalOccupancy, exclusive: exclusive || (holdExclusive && cuposLibres === 0), cuposLibres, key };
}

// Busca el carril más cercano en horario (y luego en distancia) con cupo libre
// en otra sede, para recomendarlo cuando el horario elegido está lleno.
export function findAlternativeSlot(sede, time, day, reservations, holds = []) {
  const targetMinutes = timeToMinutes(time);
  let best = null;
  SEDES.forEach((other) => {
    if (other.id === sede.id) return;
    getSlotTimesForDay(other, day).forEach((t) => {
      const eff = effectiveSlotState(other, day, t, reservations, holds);
      if (eff.cuposLibres <= 0) return;
      const diff = Math.abs(timeToMinutes(t) - targetMinutes);
      if (!best || diff < best.diff || (diff === best.diff && other.distanceMin < best.sede.distanceMin)) {
        best = { sede: other, time: t, diff, cuposLibres: eff.cuposLibres };
      }
    });
  });
  return best;
}
