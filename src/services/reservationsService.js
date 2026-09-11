import { dayLabel } from '../utils/dateUtils';
import { findSedeById, LANE_CAPACITY } from './sedesService';
import { supabase } from './supabaseClient';

export function priceFor(sede, tarifa, personas, exclusivo) {
  const rate = tarifa === 'vecino' ? sede.tariff.vecino : sede.tariff.regular;
  return exclusivo ? rate * LANE_CAPACITY : rate * Number(personas);
}

export function filterReservationsBySearch(reservations, search) {
  const q = (search || '').toLowerCase();
  return reservations.filter(
    (r) => !q || r.code.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q) || r.dni.includes(q)
  );
}

export function exportReservationsCSV(reservations, filename = 'reservas_emuss.csv') {
  const header = ['Código', 'Nombre', 'DNI', 'Sede', 'Fecha', 'Hora', 'Personas', 'Estado'];
  const lines = [header.join(',')];
  reservations.forEach((r) => {
    const sede = findSedeById(r.sedeId);
    lines.push([r.code, r.nombre, r.dni, sede ? sede.name : r.sedeId, dayLabel(r.fecha), r.time, r.personas, r.estado].join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function mapReservationRow(row) {
  return {
    code: row.code,
    sedeId: row.sede_id,
    fecha: row.fecha,
    time: row.time,
    personas: row.personas,
    exclusivo: row.exclusivo,
    nombre: row.nombre,
    dni: row.dni,
    telefono: row.telefono,
    correo: row.correo,
    tarifa: row.tarifa,
    precio: Number(row.precio),
    estado: row.estado,
    necesitaElevador: row.necesita_elevador,
    necesitaRampa: row.necesita_rampa,
    necesitaAsistencia: row.necesita_asistencia,
    vaConCuidador: row.va_con_cuidador,
    notasAccesibilidad: row.notas_accesibilidad,
    clientId: row.client_id,
    metodoPago: row.metodo_pago,
    acompanantes: row.acompanantes || [],
    createdAt: row.created_at,
  };
}

// Trae SOLO las reservas visibles para la sesión actual según RLS: las
// propias si es cliente, todas (o las de su sede) si es admin, ninguna si
// es un visitante anónimo. Para la disponibilidad pública se usa
// `slotOccupancyService` en su lugar (sin datos personales).
export async function fetchReservations() {
  const { data, error } = await supabase.from('reservations').select('*').order('fecha', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapReservationRow);
}

// Confirma la reserva a través de la función con candado (ver migración
// 0002): revalida el cupo real dentro de la misma transacción, así que si
// alguien más lo llenó justo antes, esto falla con SLOT_FULL en vez de
// generar una reserva de más. `holdId` libera el hold que la originó.
export async function confirmReservationViaLock(reservation, clientId, holdId) {
  const { data, error } = await supabase.rpc('create_reservation_with_lock', {
    p_hold_id: holdId ?? null,
    p_sede_id: reservation.sedeId,
    p_fecha: reservation.fecha,
    p_time: reservation.time,
    p_personas: reservation.personas,
    p_exclusivo: reservation.exclusivo,
    p_nombre: reservation.nombre,
    p_dni: reservation.dni,
    p_telefono: reservation.telefono,
    p_correo: reservation.correo,
    p_tarifa: reservation.tarifa,
    p_precio: reservation.precio,
    p_necesita_elevador: reservation.necesitaElevador,
    p_necesita_rampa: reservation.necesitaRampa,
    p_necesita_asistencia: reservation.necesitaAsistencia,
    p_va_con_cuidador: reservation.vaConCuidador,
    p_notas: reservation.notasAccesibilidad,
    p_client_id: clientId ?? null,
    p_metodo_pago: reservation.metodoPago || 'efectivo',
    p_acompanantes: reservation.acompanantes || [],
  });
  if (error) {
    if (error.message?.includes('slot_full')) throw new Error('SLOT_FULL');
    if (error.message?.includes('hold_already_used')) throw new Error('DUPLICATE_SUBMIT');
    throw error;
  }
  return mapReservationRow(data);
}

export async function cancelReservationByCode(code) {
  const { data, error } = await supabase
    .from('reservations')
    .update({ estado: 'cancelada' })
    .eq('code', code)
    .select()
    .single();
  if (error) throw error;
  return mapReservationRow(data);
}
