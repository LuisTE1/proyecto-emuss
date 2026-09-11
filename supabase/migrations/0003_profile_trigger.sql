-- EMUSS — crea el perfil de cliente automáticamente cuando se registra un
-- usuario nuevo, en vez de que el navegador haga un insert aparte.
--
-- Por qué: `auth.signUp()` no deja sesión activa si el proyecto tiene
-- confirmación de correo habilitada, así que un insert a `profiles` hecho
-- desde el cliente justo después del signUp choca con RLS (auth.uid() aún
-- es null). Un trigger en `auth.users`, corriendo con privilegios elevados,
-- no depende de que haya sesión — se dispara igual.
--
-- Solo crea el perfil si el signup trae "dni" en los metadatos (así se
-- distingue de una cuenta admin creada por admin-invite, que no lo trae).

create or replace function public.handle_new_client_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ? 'dni' then
    insert into public.profiles (id, nombre, dni, telefono)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'nombre', new.email),
      coalesce(new.raw_user_meta_data->>'dni', ''),
      ''
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_client_profile on auth.users;
create trigger trg_handle_new_client_profile
  after insert on auth.users
  for each row execute function public.handle_new_client_profile();
