import { supabase } from './supabaseClient';

function mapRow(row) {
  return { id: row.id, sedeId: row.sede_id, fecha: row.fecha, motivo: row.motivo };
}

// Público (sin RLS de por medio): cualquiera necesita saber qué días una
// sede no abrirá para no poder reservar ahí.
export async function fetchClosures() {
  const { data, error } = await supabase.from('sede_closures').select('*').order('fecha', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapRow);
}

export async function addClosure({ sedeId, fecha, motivo }) {
  const { data, error } = await supabase
    .from('sede_closures')
    .insert({ sede_id: sedeId, fecha, motivo: motivo || '' })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function removeClosure(id) {
  const { error } = await supabase.from('sede_closures').delete().eq('id', id);
  if (error) throw error;
}
