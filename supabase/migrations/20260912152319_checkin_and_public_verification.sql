-- Prepara el check-in en la puerta: una columna para registrar cuándo se
-- marcó el ingreso (queda null hasta que el personal lo confirme), y una
-- función de solo lectura para la página pública de verificación por QR
-- (la que abre el celular del encargado al escanear, sin necesidad de
-- iniciar sesión) — expone lo mínimo (nombre, sede, horario, estado,
-- si ya hizo check-in), nunca DNI/teléfono/correo.

alter table public.reservations add column if not exists checked_in_at timestamptz;

create or replace function public.verify_reservation_public(p_code text)
returns table (
  found boolean,
  estado text,
  nombre text,
  sede_name text,
  fecha date,
  "time" text,
  checked_in boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select
      true,
      r.estado,
      r.nombre,
      s.name,
      r.fecha,
      r.time,
      (r.checked_in_at is not null)
    from public.reservations r
    join public.sedes s on s.id = r.sede_id
    where r.code = p_code;

  if not found then
    return query select false, null::text, null::text, null::text, null::date, null::text, null::boolean;
  end if;
end;
$$;

revoke all on function public.verify_reservation_public(text) from public;
grant execute on function public.verify_reservation_public(text) to anon, authenticated;
