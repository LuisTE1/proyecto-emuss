import { supabase } from './supabaseClient';

// Mantenimiento por sede, modo pánico y el feed de actividad del panel
// admin — todo respaldado por Supabase (solo visible/editable por admins,
// según las policies de la migración).

export async function fetchMaintenanceStatus() {
  const { data, error } = await supabase.from('maintenance_status').select('sede_id, on_maintenance');
  if (error) throw error;
  const map = {};
  (data || []).forEach((row) => { map[row.sede_id] = row.on_maintenance; });
  return map;
}

export async function toggleMaintenanceStatus(sedeId, next) {
  const { error } = await supabase
    .from('maintenance_status')
    .upsert({ sede_id: sedeId, on_maintenance: next, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function fetchPanicState() {
  const { data, error } = await supabase.from('panic_state').select('active').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data?.active ?? false;
}

export async function setPanicState(active) {
  const { error } = await supabase
    .from('panic_state')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}

export async function fetchActivityLogs(limit = 8) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, text, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) => ({
    time: new Date(row.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    text: row.text,
  }));
}

export async function pushActivityLog(text) {
  const { error } = await supabase.from('activity_logs').insert({ text });
  if (error) throw error;
}
