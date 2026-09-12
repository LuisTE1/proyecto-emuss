-- Corrige dos avisos de seguridad que dejó la migración anterior:
-- 1) pg_net había quedado asociado al esquema public — no soporta ALTER
--    EXTENSION SET SCHEMA, así que se recrea directamente en `extensions`
--    (sus funciones igual viven en el esquema `net`, eso no cambia).
-- 2) dispatch_pending_slot_notifications() quedó ejecutable por cualquiera
--    vía /rest/v1/rpc/... — es solo para el cron interno, no para el
--    público (a diferencia de request_slot_hold/create_reservation_with_lock,
--    que sí son públicos a propósito).

drop extension if exists pg_net;
create extension if not exists pg_net with schema extensions;

revoke execute on function public.dispatch_pending_slot_notifications() from public, anon, authenticated;
