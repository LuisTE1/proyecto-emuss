import { dayLabel, todayISO } from '../../utils/dateUtils';
import { findSedeById } from '../../services/sedesService';

// Por cuenta (client_id), no por el DNI que se haya escrito en el
// formulario de esa reserva puntual — ese campo puede quedar distinto al
// del perfil (vacío, de un tercero, con un typo) y la reserva sigue siendo
// tuya porque la hiciste logueado.
function clientReservations(reservations, session) {
  if (!session) return [];
  return reservations.filter((r) => r.clientId === session.id);
}

function isThisMonth(fecha, today) {
  return fecha.slice(0, 7) === today.slice(0, 7);
}

function dayOfMonth(fecha) {
  return Number(fecha.slice(8, 10));
}

// KPIs reales del cliente: visitas confirmadas, horas en el agua (1h por
// reserva), inversión total y racha de semanas seguidas con al menos 1 visita.
export function buildAccountKpis(reservations, session) {
  const today = todayISO();
  const mine = clientReservations(reservations, session)
    .filter((r) => r.estado === 'confirmada' && isThisMonth(r.fecha, today));
  const visitas = mine.length;
  const horas = visitas; // cada reserva dura 1 hora
  const inversion = mine.reduce((a, r) => a + (r.precio || 0), 0);
  const promedio = visitas ? Math.round(inversion / visitas) : 0;

  const weeksWithVisit = new Set(mine.map((r) => Math.ceil(dayOfMonth(r.fecha) / 7)));
  let racha = 0;
  for (let w = Math.ceil(dayOfMonth(today) / 7); w >= 1; w--) {
    if (!weeksWithVisit.has(w)) break;
    racha++;
  }

  return [
    { label: 'Visitas este mes', value: String(visitas), trend: visitas ? `S/${promedio} por visita en promedio` : 'Aún sin reservas este mes', trendColor: '#4f46e5' },
    { label: 'Horas en el agua', value: `${horas} h`, trend: '1 hora por reserva', trendColor: '#4f46e5' },
    { label: 'Inversión este mes', value: `S/${inversion}`, trend: 'Reservas confirmadas', trendColor: '#64748b' },
    { label: 'Racha actual', value: racha > 0 ? `${racha} semana${racha > 1 ? 's' : ''}` : 'Sin racha', trend: racha > 0 ? '¡Sigue así!' : 'Reserva esta semana para empezar', trendColor: racha > 0 ? '#059669' : '#94a3b8' },
  ];
}

export function buildActivityWeeks(reservations, session) {
  const today = todayISO();
  const mine = clientReservations(reservations, session)
    .filter((r) => r.estado === 'confirmada' && isThisMonth(r.fecha, today));
  const counts = [0, 0, 0, 0];
  mine.forEach((r) => {
    const week = Math.min(4, Math.ceil(dayOfMonth(r.fecha) / 7)) - 1;
    counts[week] += 1;
  });
  return counts.map((count, i) => ({ label: `Sem ${i + 1}`, count }));
}

export function buildAccountReservations(reservations, session, actions) {
  const today = todayISO();
  return clientReservations(reservations, session)
    .slice()
    .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
    .map((r) => {
      const sede = findSedeById(r.sedeId);
      const isUpcoming = r.fecha >= today;
      return {
        code: r.code,
        sedeName: sede ? sede.name : r.sedeId,
        fecha: dayLabel(r.fecha),
        time: r.time,
        personas: r.personas,
        estadoLabel: r.estado === 'confirmada' ? (isUpcoming ? 'Próxima' : 'Pasada') : 'Cancelada',
        cancelable: r.estado === 'confirmada' && isUpcoming,
        badgeVariant: r.estado !== 'confirmada' ? 'cancelled' : (isUpcoming ? 'upcoming' : 'past'),
        onCancel: () => actions.cancelReservaByCode(r.code),
      };
    });
}

// Notificaciones reales (no un mock): un evento por cada reserva propia,
// confirmada o cancelada, más reciente primero — así lo que se ve aquí es
// exactamente lo que pasó, no ejemplos inventados.
export function buildAccountNotifications(reservations, session) {
  const mine = clientReservations(reservations, session);
  return mine
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 10)
    .map((r) => {
      const sede = findSedeById(r.sedeId);
      const sedeName = sede ? sede.name : r.sedeId;
      const cancelled = r.estado !== 'confirmada';
      return {
        id: r.code,
        cancelled,
        title: cancelled ? 'Reserva cancelada' : 'Reserva confirmada',
        text: `${sedeName} · ${dayLabel(r.fecha)} · ${r.time} · ${r.code}`,
        time: r.createdAt ? new Date(r.createdAt).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '',
      };
    });
}

// Recomendación real: el horario (sede + hora) que más se repite en el
// historial confirmado del cliente, para ofrecerle repetirlo.
export function buildAccountRecommendation(reservations, session) {
  const mine = clientReservations(reservations, session).filter((r) => r.estado === 'confirmada');
  if (mine.length < 2) return null;

  const counts = new Map();
  mine.forEach((r) => {
    const key = `${r.sedeId}|${r.time}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  let bestKey = null;
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) { bestCount = count; bestKey = key; }
  });
  if (!bestKey || bestCount < 2) return null;

  const [sedeId, time] = bestKey.split('|');
  const sede = findSedeById(sedeId);
  return {
    icon: '🔁',
    title: 'Repite tu horario habitual',
    text: `Reservaste ${sede ? sede.name : sedeId} a las ${time.split(' - ')[0]} ${bestCount} veces este mes. ¿Reservamos el mismo horario de nuevo?`,
  };
}
