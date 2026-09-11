-- Cierra las advertencias de seguridad del linter de Supabase encontradas
-- después de agregar los holds/candados: helpers de RLS expuestos como RPC
-- público, una función de trigger sin search_path fijo, y la policy pública
-- de "sedes" que no había quedado creada.

-- 1) sedes: RLS estaba habilitado pero sin política — quedaba oculta para
-- todo el mundo en vez de pública como se pensó.
create policy "sedes_select_anyone" on public.sedes for select using (true);

-- 2) search_path mutable = riesgo de "search_path hijacking".
alter function public.set_reservation_code() set search_path = public;

-- 3) is_admin / is_super_admin / admin_sede_id son helpers para usar DENTRO
-- de las policies (RLS), no para llamarse directo por RPC. Se mueven a un
-- schema que la Data API no expone — las policies que ya los referencian
-- siguen funcionando (Postgres las liga por OID, no por nombre, así que
-- mover de schema no las rompe). anon/authenticated SÍ necesitan poder
-- ejecutarlos igual, porque son ellos quienes disparan la evaluación de la
-- policy — el aislamiento de schema ya es la protección real, no el grant.
create schema if not exists private;
alter function public.is_admin() set schema private;
alter function public.is_super_admin() set schema private;
alter function public.admin_sede_id() set schema private;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_super_admin() to anon, authenticated;
grant execute on function private.admin_sede_id() to anon, authenticated;

-- 4) sync_slot_occupancy es un trigger interno: no hace falta que se pueda
-- invocar directo por /rest/v1/rpc/sync_slot_occupancy (la ejecución del
-- trigger no depende de este grant).
revoke execute on function public.sync_slot_occupancy() from anon, authenticated, public;

-- request_slot_hold / create_reservation_with_lock / update_slot_hold SÍ
-- deben ser ejecutables por anon/authenticated a propósito — son el flujo
-- de reserva en sí. El linter los marca, pero es el diseño esperado.
