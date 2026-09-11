-- ============================================================
-- 1) CIERRES DE SEDE POR FECHA — "hoy no abrimos" / mantenimiento de un día
-- completo, en vez de solo un toggle global de "en mantenimiento".
-- ============================================================
create table if not exists public.sede_closures (
  id uuid primary key default gen_random_uuid(),
  sede_id text not null references public.sedes(id),
  fecha date not null,
  motivo text not null default '',
  created_at timestamptz not null default now(),
  unique (sede_id, fecha)
);

alter table public.sede_closures enable row level security;

-- Pública para lectura: el sitio público necesita saber qué días están
-- cerrados para no dejar reservar ahí, sin exponer nada sensible.
create policy "sede_closures_select_anyone" on public.sede_closures for select using (true);
create policy "sede_closures_insert_admin" on public.sede_closures for insert with check (
  private.is_super_admin() or (private.is_admin() and sede_id = private.admin_sede_id())
);
create policy "sede_closures_delete_admin" on public.sede_closures for delete using (
  private.is_super_admin() or (private.is_admin() and sede_id = private.admin_sede_id())
);

alter publication supabase_realtime add table public.sede_closures;

-- ============================================================
-- 2) CONTACTO DE EMERGENCIA en la reserva (distinto al teléfono del titular)
-- ============================================================
alter table public.reservations
  add column if not exists contacto_emergencia text not null default '';

drop function if exists public.create_reservation_with_lock(
  uuid, text, date, text, int, boolean, text, text, text, text, text, numeric,
  boolean, boolean, boolean, boolean, text, uuid, text, jsonb
);
create or replace function public.create_reservation_with_lock(
  p_hold_id uuid,
  p_sede_id text, p_fecha date, p_time text, p_personas int, p_exclusivo boolean,
  p_nombre text, p_dni text, p_telefono text, p_correo text, p_tarifa text, p_precio numeric,
  p_necesita_elevador boolean, p_necesita_rampa boolean, p_necesita_asistencia boolean,
  p_va_con_cuidador boolean, p_notas text, p_client_id uuid,
  p_metodo_pago text default 'efectivo', p_acompanantes jsonb default '[]'::jsonb,
  p_contacto_emergencia text default ''
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
  v_closed boolean;
begin
  v_lock_key := hashtextextended(p_sede_id || '|' || p_fecha::text || '|' || p_time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select exists(select 1 from public.sede_closures where sede_id = p_sede_id and fecha = p_fecha) into v_closed;
  if v_closed then
    raise exception 'sede_closed';
  end if;

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
    metodo_pago, acompanantes, contacto_emergencia
  ) values (
    p_sede_id, p_fecha, p_time, p_personas, p_exclusivo, p_nombre, p_dni, p_telefono, p_correo, p_tarifa, p_precio,
    p_necesita_elevador, p_necesita_rampa, p_necesita_asistencia, p_va_con_cuidador, p_notas, p_client_id,
    p_metodo_pago, p_acompanantes, p_contacto_emergencia
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
  boolean, boolean, boolean, boolean, text, uuid, text, jsonb, text
) to anon, authenticated;

-- request_slot_hold también debe negarse en un día cerrado, si no un
-- visitante podría "reservar" (guardar cupo) un día que la sede no abrirá.
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
  v_closed boolean;
begin
  v_lock_key := hashtextextended(p_sede_id || '|' || p_fecha::text || '|' || p_time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select exists(select 1 from public.sede_closures where sede_id = p_sede_id and fecha = p_fecha) into v_closed;
  if v_closed then
    raise exception 'sede_closed';
  end if;

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

-- ============================================================
-- 3) CANCELACIÓN PÚBLICA POR CÓDIGO — para el enlace del correo, funcione
-- logueado o no. El código (EMUSS-1234) es secuencial y adivinable, así
-- que por sí solo NO basta como prueba de identidad: además hay que
-- acertar el DNI o el correo con el que se hizo esa reserva puntual.
-- ============================================================
create or replace function public.cancel_reservation_public(p_code text, p_dni_or_correo text)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.reservations;
begin
  select * into v_row from public.reservations where code = p_code;
  if v_row.id is null then
    raise exception 'reservation_not_found';
  end if;

  -- La identidad SIEMPRE se verifica primero, sin importar el estado
  -- actual — si no, una reserva ya cancelada se podía leer completa (dni,
  -- teléfono, correo) solo con el código, que es secuencial y adivinable.
  if lower(trim(p_dni_or_correo)) <> lower(trim(v_row.dni))
     and lower(trim(p_dni_or_correo)) <> lower(trim(v_row.correo)) then
    raise exception 'identity_mismatch';
  end if;

  if v_row.estado = 'cancelada' then
    return v_row;
  end if;

  update public.reservations set estado = 'cancelada' where code = p_code returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.cancel_reservation_public(text, text) to anon, authenticated;
