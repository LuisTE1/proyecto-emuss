-- ============================================================
-- MODELO DE FECHAS REAL
--
-- Hasta ahora "day" era un entero 1-30 que representaba un día del mes,
-- pero NINGÚN mes ni año se guardaba en ninguna parte — todo el sistema
-- (frontend y backend) asumía en silencio "Setiembre 2026" a la fuerza,
-- por eso el calendario no podía avanzar a otro mes de verdad. Esta
-- migración reemplaza esa columna por una fecha real (`date`) en
-- reservations, reservation_holds, slot_occupancy y notify_requests, y
-- reescribe las funciones con candado para usarla. Los datos existentes
-- se convierten asumiendo que su "day" era Setiembre 2026 (correcto, es
-- lo único que ha existido hasta ahora).
-- ============================================================

-- ---- reservations ----
alter table public.reservations add column if not exists fecha date;
update public.reservations set fecha = make_date(2026, 9, day) where fecha is null;
alter table public.reservations alter column fecha set not null;
drop index if exists reservations_sede_day_idx;
alter table public.reservations drop column day;
create index if not exists reservations_sede_fecha_idx on public.reservations(sede_id, fecha);

-- ---- reservation_holds ----
alter table public.reservation_holds add column if not exists fecha date;
update public.reservation_holds set fecha = make_date(2026, 9, day) where fecha is null;
alter table public.reservation_holds alter column fecha set not null;
drop index if exists reservation_holds_slot_idx;
alter table public.reservation_holds drop column day;
create index if not exists reservation_holds_slot_idx on public.reservation_holds(sede_id, fecha, time);

-- ---- slot_occupancy ----
alter table public.slot_occupancy add column if not exists fecha date;
update public.slot_occupancy set fecha = make_date(2026, 9, day) where fecha is null;
alter table public.slot_occupancy alter column fecha set not null;
alter table public.slot_occupancy drop column day;

-- ---- notify_requests ----
alter table public.notify_requests add column if not exists fecha date;
update public.notify_requests set fecha = make_date(2026, 9, day) where fecha is null;
alter table public.notify_requests alter column fecha set not null;
alter table public.notify_requests drop column day;

-- ---- trigger de sincronización slot_occupancy (usa fecha ahora) ----
create or replace function public.sync_slot_occupancy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.slot_occupancy (reservation_code, sede_id, fecha, time, personas, exclusivo, estado)
  values (new.code, new.sede_id, new.fecha, new.time, new.personas, new.exclusivo, new.estado)
  on conflict (reservation_code) do update
    set personas = excluded.personas, exclusivo = excluded.exclusivo, estado = excluded.estado;
  return new;
end;
$$;

-- ---- request_slot_hold: p_day int -> p_fecha date ----
drop function if exists public.request_slot_hold(text, int, text, int);
create or replace function public.request_slot_hold(
  p_sede_id text, p_fecha date, p_time text, p_hold_seconds int default 480
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
  v_lock_key := hashtextextended(p_sede_id || '|' || p_fecha::text || '|' || p_time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_confirmed_occupancy, v_confirmed_exclusive
    from public.reservations
    where sede_id = p_sede_id and fecha = p_fecha and time = p_time and estado = 'confirmada';

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_holds_occupancy, v_holds_exclusive
    from public.reservation_holds
    where sede_id = p_sede_id and fecha = p_fecha and time = p_time and expires_at > now();

  if v_confirmed_exclusive or v_holds_exclusive
     or (v_confirmed_occupancy + v_holds_occupancy) >= v_capacity then
    raise exception 'slot_full';
  end if;

  insert into public.reservation_holds (sede_id, fecha, time, personas, exclusivo, expires_at)
  values (p_sede_id, p_fecha, p_time, 1, false, now() + make_interval(secs => p_hold_seconds))
  returning * into v_hold;

  return v_hold;
end;
$$;

grant execute on function public.request_slot_hold(text, date, text, int) to anon, authenticated;

-- ---- create_reservation_with_lock: p_day int -> p_fecha date ----
drop function if exists public.create_reservation_with_lock(
  uuid, text, int, text, int, boolean, text, text, text, text, text, numeric,
  boolean, boolean, boolean, boolean, text, uuid, text, jsonb
);
create or replace function public.create_reservation_with_lock(
  p_hold_id uuid,
  p_sede_id text, p_fecha date, p_time text, p_personas int, p_exclusivo boolean,
  p_nombre text, p_dni text, p_telefono text, p_correo text, p_tarifa text, p_precio numeric,
  p_necesita_elevador boolean, p_necesita_rampa boolean, p_necesita_asistencia boolean,
  p_va_con_cuidador boolean, p_notas text, p_client_id uuid,
  p_metodo_pago text default 'efectivo', p_acompanantes jsonb default '[]'::jsonb
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
  v_lock_key := hashtextextended(p_sede_id || '|' || p_fecha::text || '|' || p_time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  if p_hold_id is not null and not exists (select 1 from public.reservation_holds where id = p_hold_id) then
    raise exception 'hold_already_used';
  end if;

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_confirmed_occupancy, v_confirmed_exclusive
    from public.reservations
    where sede_id = p_sede_id and fecha = p_fecha and time = p_time and estado = 'confirmada';

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_holds_occupancy, v_holds_exclusive
    from public.reservation_holds
    where sede_id = p_sede_id and fecha = p_fecha and time = p_time and expires_at > now()
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
    sede_id, fecha, time, personas, exclusivo, nombre, dni, telefono, correo, tarifa, precio,
    necesita_elevador, necesita_rampa, necesita_asistencia, va_con_cuidador, notas_accesibilidad, client_id,
    metodo_pago, acompanantes
  ) values (
    p_sede_id, p_fecha, p_time, p_personas, p_exclusivo, p_nombre, p_dni, p_telefono, p_correo, p_tarifa, p_precio,
    p_necesita_elevador, p_necesita_rampa, p_necesita_asistencia, p_va_con_cuidador, p_notas, p_client_id,
    p_metodo_pago, p_acompanantes
  )
  returning * into v_row;

  if p_hold_id is not null then
    delete from public.reservation_holds where id = p_hold_id;
  end if;

  return v_row;
end;
$$;

grant execute on function public.create_reservation_with_lock(
  uuid, text, date, text, int, boolean, text, text, text, text, text, numeric,
  boolean, boolean, boolean, boolean, text, uuid, text, jsonb
) to anon, authenticated;

-- ---- update_slot_hold: internamente usaba v_hold.day, ahora v_hold.fecha (firma no cambia) ----
create or replace function public.update_slot_hold(
  p_hold_id uuid, p_personas int, p_exclusivo boolean
)
returns public.reservation_holds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hold public.reservation_holds;
  v_lock_key bigint;
  v_capacity constant int := 3;
  v_confirmed_occupancy int;
  v_confirmed_exclusive boolean;
  v_holds_occupancy int;
  v_holds_exclusive boolean;
begin
  select * into v_hold from public.reservation_holds where id = p_hold_id and expires_at > now();
  if v_hold.id is null then
    raise exception 'hold_not_found';
  end if;

  v_lock_key := hashtextextended(v_hold.sede_id || '|' || v_hold.fecha::text || '|' || v_hold.time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_confirmed_occupancy, v_confirmed_exclusive
    from public.reservations
    where sede_id = v_hold.sede_id and fecha = v_hold.fecha and time = v_hold.time and estado = 'confirmada';

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_holds_occupancy, v_holds_exclusive
    from public.reservation_holds
    where sede_id = v_hold.sede_id and fecha = v_hold.fecha and time = v_hold.time and expires_at > now()
      and id <> p_hold_id;

  if v_confirmed_exclusive or v_holds_exclusive then
    raise exception 'slot_full';
  end if;
  if p_exclusivo and (v_confirmed_occupancy + v_holds_occupancy) > 0 then
    raise exception 'slot_full';
  end if;
  if not p_exclusivo and (v_confirmed_occupancy + v_holds_occupancy + p_personas) > v_capacity then
    raise exception 'slot_full';
  end if;

  update public.reservation_holds
    set personas = p_personas, exclusivo = p_exclusivo
    where id = p_hold_id
    returning * into v_hold;

  return v_hold;
end;
$$;

grant execute on function public.update_slot_hold(uuid, int, boolean) to anon, authenticated;
