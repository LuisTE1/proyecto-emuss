import { supabase } from './supabaseClient';

function mapRow(row) {
  return { id: row.id, nombre: row.nombre, correo: row.correo, rol: row.rol, sedeId: row.sede_id };
}

export async function fetchAdminUsers() {
  const { data, error } = await supabase.from('admin_users').select('*').order('nombre', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapRow);
}

// Crea el usuario de Auth + su fila en admin_users vía Edge Function
// (necesita el service role, así que no se puede hacer directo desde el
// cliente). Requiere estar logueado como Super Admin.
export async function inviteAdminUser({ nombre, correo, rol, sedeId }) {
  const { data, error } = await supabase.functions.invoke('admin-invite', {
    body: { nombre, correo, rol, sedeId: rol === 'Super Admin' ? null : sedeId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function updateAdminRol(id, rol, fallbackSedeId) {
  const { data, error } = await supabase
    .from('admin_users')
    .update({ rol, sede_id: rol === 'Super Admin' ? null : fallbackSedeId })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateAdminSede(id, sedeId) {
  const { data, error } = await supabase.from('admin_users').update({ sede_id: sedeId }).eq('id', id).select().single();
  if (error) throw error;
  return mapRow(data);
}

// Quita el acceso de administrador (borra la fila de admin_users): la
// cuenta de Auth de la persona sigue existiendo, solo deja de ser admin.
export async function removeAdminUser(id) {
  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  if (error) throw error;
}
