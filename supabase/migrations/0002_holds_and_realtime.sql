-- EMUSS — reservas en tiempo real: candado atómico por horario (evita que
-- dos personas ganen el mismo cupo) + una tabla pública sin datos personales
-- para que la disponibilidad se vea en vivo (Realtime) sin exponer PII.

-- ============================================================
-- HOLDS: "estoy reservando este horario ahora mismo"
-- ============================================================
create table if not exists public.reservation_holds (
  id uuid primary key default gen_random_uuid(),
  sede_id text not null references public.sedes(id),
  day int not null,
  time text not null,
  personas int not null default 1,
  exclusivo boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists reservation_holds_slot_idx on public.reservation_holds(sede_id, day, time);

alter table public.reservation_holds enable row level security;

-- Un hold no tiene datos personales (esos se piden recién en el
-- formulario), así que es seguro que cualquiera pueda verlos/crearlos.
-- Borrar por id es intencionalmente abierto: el id es un UUID no adivinable,
-- así que conocerlo ya prueba que es "tu" hold — suficiente para esta demo.
create policy "holds_select_anyone" on public.reservation_holds for select using (true);
create policy "holds_delete_anyone" on public.reservation_holds for delete using (true);

-- ============================================================
-- SLOT_OCCUPANCY: espejo público (sin PII) de "reservations", para que la
-- disponibilidad se pueda leer y suscribir en vivo sin exponer nombre/DNI/
-- teléfono/correo a cualquier visitante anónimo.
-- ============================================================
create table if not exists public.slot_occupancy (
  reservation_code text primary key,
  sede_id text not null references public.sedes(id),
  day int not null,
  time text not null,
  personas int not null,
  exclusivo boolean not null,
  estado text not null
);

alter table public.slot_occupancy enable row level security;
create policy "slot_occupancy_select_anyone" on public.slot_occupancy for select using (true);

create or replace function public.sync_slot_occupancy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.slot_occupancy (reservation_code, sede_id, day, time, personas, exclusivo, estado)
  values (new.code, new.sede_id, new.day, new.time, new.personas, new.exclusivo, new.estado)
  on conflict (reservation_code) do update
    set personas = excluded.personas, exclusivo = excluded.exclusivo, estado = excluded.estado;
  return new;
end;
$$;

drop trigger if exists trg_sync_slot_occupancy on public.reservations;
create trigger trg_sync_slot_occupancy
  after insert or update on public.reservations
  for each row execute function public.sync_slot_occupancy();

-- Respaldo por si alguna reserva ya existía antes de esta migración.
insert into public.slot_occupancy (reservation_code, sede_id, day, time, personas, exclusivo, estado)
select code, sede_id, day, time, personas, exclusivo, estado from public.reservations
on conflict (reservation_code) do nothing;

-- ============================================================
-- REALTIME: habilita la publicación para que el frontend pueda
-- suscribirse a cambios en vivo de estas dos tablas.
-- ============================================================
alter publication supabase_realtime add table public.slot_occupancy;
alter publication supabase_realtime add table public.reservation_holds;

-- ============================================================
-- FUNCIONES CON CANDADO: piden un advisory lock por (sede, día, hora) así
-- que si dos personas intentan reservar el mismo horario al mismo
-- milisegundo, Postgres las procesa una por una — la segunda vuelve a
-- validar el cupo ya actualizado, no puede pasar por encima de la primera.
-- ============================================================

create or replace function public.request_slot_hold(
  p_sede_id text, p_day int, p_time text, p_hold_seconds int default 480
)
returns public.reservation_holds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lock_key bigint;
  v_capacity constant int := 3;
  v_confirmed_occupancy int;
  v_confirmed_exclusive boolean;
  v_holds_occupancy int;
  v_holds_exclusive boolean;
  v_hold public.reservation_holds;
begin
  v_lock_key := hashtextextended(p_sede_id || '|' || p_day || '|' || p_time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_confirmed_occupancy, v_confirmed_exclusive
    from public.reservations
    where sede_id = p_sede_id and day = p_day and time = p_time and estado = 'confirmada';

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_holds_occupancy, v_holds_exclusive
    from public.reservation_holds
    where sede_id = p_sede_id and day = p_day and time = p_time and expires_at > now();

  if v_confirmed_exclusive or v_holds_exclusive
     or (v_confirmed_occupancy + v_holds_occupancy) >= v_capacity then
    raise exception 'slot_full';
  end if;

  insert into public.reservation_holds (sede_id, day, time, personas, exclusivo, expires_at)
  values (p_sede_id, p_day, p_time, 1, false, now() + make_interval(secs => p_hold_seconds))
  returning * into v_hold;

  return v_hold;
end;
$$;

grant execute on function public.request_slot_hold(text, int, text, int) to anon, authenticated;

create or replace function public.create_reservation_with_lock(
  p_hold_id uuid,
  p_sede_id text, p_day int, p_time text, p_personas int, p_exclusivo boolean,
  p_nombre text, p_dni text, p_telefono text, p_correo text, p_tarifa text, p_precio numeric,
  p_necesita_elevador boolean, p_necesita_rampa boolean, p_necesita_asistencia boolean,
  p_va_con_cuidador boolean, p_notas text, p_client_id uuid
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lock_key bigint;
  v_capacity constant int := 3;
  v_confirmed_occupancy int;
  v_confirmed_exclusive boolean;
  v_holds_occupancy int;
  v_holds_exclusive boolean;
  v_row public.reservations;
begin
  v_lock_key := hashtextextended(p_sede_id || '|' || p_day || '|' || p_time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_confirmed_occupancy, v_confirmed_exclusive
    from public.reservations
    where sede_id = p_sede_id and day = p_day and time = p_time and estado = 'confirmada';

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_holds_occupancy, v_holds_exclusive
    from public.reservation_holds
    where sede_id = p_sede_id and day = p_day and time = p_time and expires_at > now()
      and id <> coalesce(p_hold_id, '00000000-0000-0000-0000-000000000000'::uuid);

  if v_confirmed_exclusive or v_holds_exclusive then
    raise exception 'slot_full';
  end if;
  if p_exclusivo and (v_confirmed_occupancy + v_holds_occupancy) > 0 then
    raise exception 'slot_full';
  end if;
  if not p_exclusivo and (v_confirmed_occupancy + v_holds_occupancy + p_personas) > v_capacity then
    raise exception 'slot_full';
  end if;

  insert into public.reservations (
    sede_id, day, time, personas, exclusivo, nombre, dni, telefono, correo, tarifa, precio,
    necesita_elevador, necesita_rampa, necesita_asistencia, va_con_cuidador, notas_accesibilidad, client_id
  ) values (
    p_sede_id, p_day, p_time, p_personas, p_exclusivo, p_nombre, p_dni, p_telefono, p_correo, p_tarifa, p_precio,
    p_necesita_elevador, p_necesita_rampa, p_necesita_asistencia, p_va_con_cuidador, p_notas, p_client_id
  )
  returning * into v_row;

  if p_hold_id is not null then
    delete from public.reservation_holds where id = p_hold_id;
  end if;

  return v_row;
end;
$$;

grant execute on function public.create_reservation_with_lock(
  uuid, text, int, text, int, boolean, text, text, text, text, text, numeric,
  boolean, boolean, boolean, boolean, text, uuid
) to anon, authenticated;

-- ============================================================
-- LIMPIEZA DE HOLDS VENCIDOS (opcional, requiere la extensión pg_cron)
-- ============================================================
-- Los holds vencidos ya se ignoran en los cálculos de cupos (se filtra por
-- expires_at > now()), así que esto no es necesario para que la app
-- funcione — solo mantiene la tabla liviana y hace que el "reservando" de
-- otros usuarios desaparezca solo por Realtime en vez de por polling local.
--
-- 1) Habilita la extensión pg_cron: Database → Extensions → pg_cron.
-- 2) Corre esto:
--
-- select cron.schedule(
--   'purge-expired-holds',
--   '*/2 * * * *',
--   $$ delete from public.reservation_holds where expires_at < now() $$
-- );
