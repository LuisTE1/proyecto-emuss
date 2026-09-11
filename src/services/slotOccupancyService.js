import { supabase } from './supabaseClient';

// Espejo público (sin nombre/DNI/teléfono/correo) de `reservations`, para
// que cualquier visitante — logueado o no — pueda ver disponibilidad en
// tiempo real sin exponer datos personales de otras personas.
export function mapSlotOccupancyRow(row) {
  return {
    code: row.reservation_code,
    sedeId: row.sede_id,
    day: row.day,
    time: row.time,
    personas: row.personas,
    exclusivo: row.exclusivo,
    estado: row.estado,
  };
}

export async function fetchSlotOccupancy() {
  const { data, error } = await supabase.from('slot_occupancy').select('*');
  if (error) throw error;
  return (data || []).map(mapSlotOccupancyRow);
}
