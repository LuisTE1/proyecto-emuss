import { supabase } from './supabaseClient';

export function mapHoldRow(row) {
  return {
    id: row.id,
    sedeId: row.sede_id,
    fecha: row.fecha,
    time: row.time,
    personas: row.personas,
    exclusivo: row.exclusivo,
    expiresAt: row.expires_at,
  };
}

export async function fetchActiveHolds() {
  const { data, error } = await supabase
    .from('reservation_holds')
    .select('*')
    .gt('expires_at', new Date().toISOString());
  if (error) throw error;
  return (data || []).map(mapHoldRow);
}

// Pide el candado del horario vía RPC: si alguien más ya lo llenó, la base
// de datos rechaza con 'slot_full' antes de dejarte abrir el formulario.
export async function createHold({ sedeId, fecha, time, holdSeconds }) {
  const { data, error } = await supabase.rpc('request_slot_hold', {
    p_sede_id: sedeId,
    p_fecha: fecha,
    p_time: time,
    p_hold_seconds: holdSeconds,
  });
  if (error) {
    if (error.message?.includes('slot_full')) throw new Error('SLOT_FULL');
    throw error;
  }
  return mapHoldRow(data);
}

export async function releaseHold(holdId) {
  if (!holdId) return;
  const { error } = await supabase.from('reservation_holds').delete().eq('id', holdId);
  if (error) throw error;
}

// Igual que releaseHold, pero pensado para dispararse en 'pagehide' (cierre
// de pestaña / navegación fuera de la app a medio formulario): en ese
// momento un fetch normal puede quedar cortado antes de salir, así que se
// usa `keepalive` para que el navegador lo complete aunque la página ya se
// haya descargado — evita que el cupo quede bloqueado hasta que venza el
// hold (hasta 8 minutos) solo por haber cerrado la pestaña.
export function releaseHoldBeacon(holdId) {
  if (!holdId) return;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return;
  try {
    fetch(`${url}/rest/v1/reservation_holds?id=eq.${encodeURIComponent(holdId)}`, {
      method: 'DELETE',
      keepalive: true,
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    }).catch(() => {});
  } catch { /* best-effort */ }
}

// Mantiene el hold al día con lo que la persona va marcando en el
// formulario (personas / carril exclusivo), revalidando el cupo real —
// así otros usuarios ven el horario reflejar esa intención al instante,
// no recién cuando se confirma la reserva.
export async function updateHold({ holdId, personas, exclusivo }) {
  const { data, error } = await supabase.rpc('update_slot_hold', {
    p_hold_id: holdId,
    p_personas: personas,
    p_exclusivo: exclusivo,
  });
  if (error) {
    if (error.message?.includes('slot_full')) throw new Error('SLOT_FULL');
    throw error;
  }
  return mapHoldRow(data);
}
