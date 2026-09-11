-- EMUSS — agrega método de pago y datos de acompañantes a las reservas, y
-- resguarda create_reservation_with_lock contra envíos duplicados del mismo
-- formulario (doble clic): con esta llave única, un segundo intento con el
-- mismo hold_id ya consumido falla en vez de crear una reserva repetida.

alter table public.reservations
  add column if not exists metodo_pago text not null default 'efectivo'
    check (metodo_pago in ('tarjeta', 'efectivo', 'transferencia')),
  add column if not exists acompanantes jsonb not null default '[]'::jsonb;

drop function if exists public.create_reservation_with_lock(
  uuid, text, int, text, int, boolean, text, text, text, text, text, numeric,
  boolean, boolean, boolean, boolean, text, uuid
);

create or replace function public.create_reservation_with_lock(
  p_hold_id uuid,
  p_sede_id text, p_day int, p_time text, p_personas int, p_exclusivo boolean,
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
  v_lock_key := hashtextextended(p_sede_id || '|' || p_day || '|' || p_time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  -- Un hold ya usado (borrado) para crear una reserva no puede volver a
  -- usarse: si el mismo clic llega dos veces, la segunda vez p_hold_id ya no
  -- existe en reservation_holds y esto corta antes de duplicar la reserva.
  if p_hold_id is not null and not exists (select 1 from public.reservation_holds where id = p_hold_id) then
    raise exception 'hold_already_used';
  end if;

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
    necesita_elevador, necesita_rampa, necesita_asistencia, va_con_cuidador, notas_accesibilidad, client_id,
    metodo_pago, acompanantes
  ) values (
    p_sede_id, p_day, p_time, p_personas, p_exclusivo, p_nombre, p_dni, p_telefono, p_correo, p_tarifa, p_precio,
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
  uuid, text, int, text, int, boolean, text, text, text, text, text, numeric,
  boolean, boolean, boolean, boolean, text, uuid, text, jsonb
) to anon, authenticated;
