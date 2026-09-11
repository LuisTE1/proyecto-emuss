import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// true una vez que el proyecto Supabase real está conectado (variables en
// .env). Hasta entonces la app no tiene backend y las pantallas que
// dependen de él deben mostrarlo en vez de fallar en silencio.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
