-- El feed de actividad del panel admin se alimenta de reservas hechas por
-- CUALQUIERA (clientes logueados, invitados), no solo por administradores,
-- pero la policy de insert solo dejaba escribir a admins — cada reserva de
-- un cliente/invitado fallaba en silencio (403, atrapado por .catch) y
-- nunca aparecía en el registro de actividad del panel. La lectura sigue
-- siendo solo para admins.
drop policy if exists "activity_logs_insert_admin" on public.activity_logs;
create policy "activity_logs_insert_anyone" on public.activity_logs
  for insert with check (true);
