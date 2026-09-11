// Edge Function: admin-invite
//
// Crea un nuevo usuario administrador (RBAC) de verdad: un admin_users.id
// tiene que apuntar a un auth.users real, y solo el service role puede
// crear usuarios de Auth — por eso esto no se puede hacer desde el
// frontend con la anon key, tiene que pasar por una función server-side.
//
// Solo un Super Admin autenticado puede invocarla (se valida el JWT del
// llamador contra admin_users antes de crear nada).
//
// Se invoca desde el frontend con:
//   supabase.functions.invoke('admin-invite', {
//     body: { nombre, correo, rol, sedeId }
//   })
// (el SDK ya manda el Authorization: Bearer <token> de la sesión activa)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function randomTempPassword() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'No autenticado.' }, 401);

  // Cliente "como el usuario que llama", solo para verificar quién es.
  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !callerData?.user) return json({ error: 'Sesión inválida.' }, 401);

  // Cliente con service role, para las operaciones privilegiadas.
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: callerAdmin } = await adminClient
    .from('admin_users')
    .select('rol')
    .eq('id', callerData.user.id)
    .maybeSingle();

  if (!callerAdmin || callerAdmin.rol !== 'Super Admin') {
    return json({ error: 'Solo un Super Admin puede agregar administradores.' }, 403);
  }

  try {
    const { nombre, correo, rol, sedeId } = await req.json();
    if (!nombre || !correo || !rol) {
      return json({ error: 'Faltan campos: nombre, correo, rol.' }, 400);
    }

    const tempPassword = randomTempPassword();
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: correo,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { nombre },
    });
    if (createError || !created?.user) {
      return json({ error: createError?.message ?? 'No se pudo crear el usuario.' }, 400);
    }

    const { error: insertError } = await adminClient.from('admin_users').insert({
      id: created.user.id,
      nombre,
      correo,
      rol,
      sede_id: rol === 'Super Admin' ? null : sedeId ?? null,
    });
    if (insertError) {
      // Deja el auth.user huérfano si esto falla es peor que no crear nada — se revierte.
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: insertError.message }, 400);
    }

    // En un producto real esto se manda por correo (invite link), no se
    // devuelve en la respuesta. Para la demo, el Super Admin lo comparte a mano.
    return json({ ok: true, tempPassword });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
