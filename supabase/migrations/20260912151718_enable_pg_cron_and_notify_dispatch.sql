-- Habilita pg_cron/pg_net y agrega el despacho real de "avisarme si se
-- libera un cupo": hasta ahora notify_requests solo se llenaba, nadie la
-- leía. Este job corre cada minuto, busca solicitudes pendientes cuyo
-- horario ya tiene cupo libre, dispara la Edge Function
-- dispatch-slot-notifications (que envía el correo) y marca la solicitud
-- como atendida.
--
-- Requiere un paso manual de configuración (no se hace aquí porque son
-- valores del proyecto, no schema): guardar la URL del proyecto y la anon
-- key en Supabase Vault:
--   select vault.create_secret('https://TU-PROYECTO.supabase.co', 'project_url');
--   select vault.create_secret('tu-anon-key-publica', 'project_anon_key');
-- Mientras esos dos secretos no existan, la función no hace nada (no
-- falla, solo no encuentra nada que enviar).

create extension if not exists pg_cron;
create extension if not exists pg_net;

grant usage on schema cron to postgres;

create or replace function public.dispatch_pending_slot_notifications()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_project_url text;
  v_anon_key text;
  v_capacity constant int := 3;
  r record;
begin
  select decrypted_secret into v_project_url from vault.decrypted_secrets where name = 'project_url' limit 1;
  select decrypted_secret into v_anon_key from vault.decrypted_secrets where name = 'project_anon_key' limit 1;

  if v_project_url is null or v_anon_key is null then
    return;
  end if;

  for r in
    select nr.id, nr.sede_id, nr.sede_name, nr.time, nr.fecha, nr.contact
    from public.notify_requests nr
    where nr.notified = false
      and not exists (
        select 1 from public.sede_closures sc
        where sc.sede_id = nr.sede_id and sc.fecha = nr.fecha
      )
      and not exists (
        select 1 from public.slot_occupancy so
        where so.sede_id = nr.sede_id and so.fecha = nr.fecha and so.time = nr.time
          and so.estado = 'confirmada' and so.exclusivo = true
      )
      and not exists (
        select 1 from public.reservation_holds h
        where h.sede_id = nr.sede_id and h.fecha = nr.fecha and h.time = nr.time
          and h.expires_at > now() and h.exclusivo = true
      )
      and (
        coalesce((
          select sum(so2.personas) from public.slot_occupancy so2
          where so2.sede_id = nr.sede_id and so2.fecha = nr.fecha and so2.time = nr.time and so2.estado = 'confirmada'
        ), 0)
        +
        coalesce((
          select sum(h2.personas) from public.reservation_holds h2
          where h2.sede_id = nr.sede_id and h2.fecha = nr.fecha and h2.time = nr.time and h2.expires_at > now()
        ), 0)
      ) < v_capacity
  loop
    perform net.http_post(
      url := v_project_url || '/functions/v1/dispatch-slot-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_anon_key,
        'apikey', v_anon_key
      ),
      body := jsonb_build_object(
        'sedeId', r.sede_id, 'sedeName', r.sede_name,
        'time', r.time, 'fecha', r.fecha, 'contact', r.contact
      )
    );
    update public.notify_requests set notified = true where id = r.id;
  end loop;
end;
$$;

select cron.unschedule(jobid) from cron.job where jobname = 'dispatch-slot-notifications';

select cron.schedule(
  'dispatch-slot-notifications',
  '*/1 * * * *',
  $$select public.dispatch_pending_slot_notifications();$$
);
