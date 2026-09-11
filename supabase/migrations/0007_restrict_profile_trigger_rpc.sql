-- handle_new_client_profile es una función de trigger (usa `new`), no un
-- endpoint pensado para llamarse por RPC — el linter de seguridad la marcaba
-- como invocable por anon/authenticated vía /rest/v1/rpc/. Se le quita ese
-- grant; el trigger en auth.users sigue funcionando igual (no depende de
-- permisos de rol, corre con privilegios del dueño de la función).
revoke execute on function public.handle_new_client_profile() from anon, authenticated, public;
