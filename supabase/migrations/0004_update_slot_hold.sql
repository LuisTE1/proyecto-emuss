-- Actualiza un hold existente cuando la persona cambia "personas" o marca
-- "carril exclusivo" mientras llena el formulario, revalidando el cupo con
-- el mismo candado — así otros usuarios ven el horario como lleno/exclusivo
-- en tiempo real desde que alguien lo marca, no solo cuando confirma.
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

  v_lock_key := hashtextextended(v_hold.sede_id || '|' || v_hold.day || '|' || v_hold.time, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_confirmed_occupancy, v_confirmed_exclusive
    from public.reservations
    where sede_id = v_hold.sede_id and day = v_hold.day and time = v_hold.time and estado = 'confirmada';

  select coalesce(sum(personas), 0), coalesce(bool_or(exclusivo), false)
    into v_holds_occupancy, v_holds_exclusive
    from public.reservation_holds
    where sede_id = v_hold.sede_id and day = v_hold.day and time = v_hold.time and expires_at > now()
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
