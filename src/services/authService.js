import { supabase } from './supabaseClient';

// Sesión real vía Supabase Auth. Un mismo login sirve para clientes y para
// administradores: después de autenticar, se revisa si el usuario tiene
// fila en admin_users (admin) o en profiles (cliente).
//
// El perfil (nombre/dni) lo crea un trigger en el servidor a partir de estos
// metadatos (ver migración 0003) — no se inserta desde el navegador, porque
// si el proyecto tiene confirmación de correo activada, todavía no hay
// sesión en este punto y el insert chocaría con RLS.
export async function signUpClient({ nombre, correo, password, dni }) {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password,
    options: { data: { nombre, dni } },
  });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('No se pudo crear la cuenta.');

  if (!data.session) {
    throw new Error('EMAIL_CONFIRMATION_REQUIRED');
  }

  return { type: 'client', id: userId, nombre, dni, telefono: '', correo };
}

export async function signInWithPassword({ correo, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
  if (error) throw error;
  return loadSession(data.user.id, correo);
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  return loadSession(user.id, user.email);
}

// Determina si el usuario logueado es admin (RBAC) o cliente, y devuelve un
// objeto de sesión homogéneo para el resto de la app.
async function loadSession(userId, correo) {
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, nombre, correo, rol, sede_id')
    .eq('id', userId)
    .maybeSingle();

  if (admin) {
    return { type: 'admin', id: admin.id, nombre: admin.nombre, correo: admin.correo, rol: admin.rol, sedeId: admin.sede_id };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nombre, dni, telefono')
    .eq('id', userId)
    .maybeSingle();

  if (profile) {
    return { type: 'client', id: profile.id, nombre: profile.nombre, dni: profile.dni, telefono: profile.telefono, correo };
  }

  // Cuenta de Auth sin perfil todavía (no debería pasar en el flujo normal).
  return { type: 'client', id: userId, nombre: correo, dni: '', telefono: '', correo };
}
