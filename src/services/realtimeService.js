import { supabase } from './supabaseClient';
import { fetchActiveHolds } from './holdsService';
import { fetchClosures } from './closuresService';
import { mapSlotOccupancyRow } from './slotOccupancyService';

// Un solo canal para toda la disponibilidad: cambios en `slot_occupancy`
// (alguien confirmó o canceló), en `reservation_holds` (alguien empezó o
// dejó de estar reservando) y en `sede_closures` (un admin cerró/abrió un
// día) — así cualquier pestaña abierta ve el estado real sin refrescar.
export function subscribeToAvailabilityRealtime({ onSlotOccupancyChange, onHoldsChange, onClosuresChange }) {
  const channel = supabase.channel('availability-realtime');

  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'slot_occupancy' },
    (payload) => {
      const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
      if (row) onSlotOccupancyChange(mapSlotOccupancyRow(row));
    }
  );

  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'reservation_holds' },
    () => {
      fetchActiveHolds().then(onHoldsChange).catch(() => {});
    }
  );

  if (onClosuresChange) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sede_closures' },
      () => {
        fetchClosures().then(onClosuresChange).catch(() => {});
      }
    );
  }

  channel.subscribe();
  return channel;
}

export function unsubscribeRealtime(channel) {
  if (channel) supabase.removeChannel(channel);
}
