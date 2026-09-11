-- EMUSS — schema inicial de Supabase.
-- Correr una sola vez en el SQL Editor de tu proyecto (o con `supabase db push`).

-- ============================================================
-- SEDES (referencia estática de las piscinas)
-- ============================================================
create table if not exists public.sedes (
  id text primary key,
  name text not null,
  address text not null,
  tags text[] not null default '{}',
  map_q text not null,
  distance_min int not null default 0,
  tariff_vecino numeric not null,
  tariff_regular numeric not null,
  dynamic boolean not null default true,
  slot_times text[]
);

insert into public.sedes (id, name, address, tags, map_q, distance_min, tariff_vecino, tariff_regular, dynamic, slot_times) values
  ('chacarilla', 'Sede Chacarilla', 'Jirón Montemar 190, Urb. Chacarilla del Estanque, Surco', array['adultos','accesible'], 'Complejo Deportivo Chacarilla, Surco, Peru', 0, 35, 70, true, null),
  ('ferrero', 'Sede Ferrero', 'Av. Raúl Ferrero Nº 155, Surco', array['adultos'], 'Coliseo Ferrero, Surco, Peru', 12, 20, 40, true, null),
  ('montjoy', 'Sede Montjoy', 'Jirón Arica 581, Surco', array['infantil','adultos'], 'Coliseo Julio Montjoy, Surco, Peru', 18, 30, 60, false, array['07:00 - 08:00','08:00 - 09:00','18:00 - 19:00'])
on conflict (id) do nothing;

-- Referencia pública: sin esto, algunos proyectos ocultan por completo una
-- tabla sin RLS en vez de dejarla abierta (según la config del proyecto).
alter table public.sedes enable row level security;
create policy "sedes_select_anyone" on public.sedes for select using (true);

-- ============================================================
-- PERFILES DE CLIENTE (datos extra sobre auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  dni text not null,
  nombre text not null,
  telefono text default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- ============================================================
-- USUARIOS ADMIN (RBAC — Super Admin ve todo, Encargado de sede solo la suya)
-- ============================================================
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  correo text not null,
  rol text not null check (rol in ('Super Admin', 'Encargado de sede')),
  sede_id text references public.sedes(id),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Función auxiliar: ¿el usuario autenticado es admin? (security definer para
-- poder leer admin_users desde las policies de otras tablas sin recursión).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where id = auth.uid() and rol = 'Super Admin');
$$;

create or replace function public.admin_sede_id()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select sede_id from public.admin_users where id = auth.uid();
$$;

create policy "admin_users_select_admins" on public.admin_users
  for select using (public.is_admin());
create policy "admin_users_insert_super_admin" on public.admin_users
  for insert with check (public.is_super_admin());
create policy "admin_users_update_super_admin" on public.admin_users
  for update using (public.is_super_admin());
create policy "admin_users_delete_super_admin" on public.admin_users
  for delete using (public.is_super_admin());

-- ============================================================
-- RESERVAS
-- ============================================================
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  sede_id text not null references public.sedes(id),
  day int not null,
  time text not null,
  personas int not null default 1,
  exclusivo boolean not null default false,
  nombre text not null,
  dni text not null,
  telefono text default '',
  correo text default '',
  tarifa text not null check (tarifa in ('vecino', 'regular')),
  precio numeric not null,
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  necesita_elevador boolean not null default false,
  necesita_rampa boolean not null default false,
  necesita_asistencia boolean not null default false,
  va_con_cuidador boolean not null default false,
  notas_accesibilidad text default '',
  client_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists reservations_client_id_idx on public.reservations(client_id);
create index if not exists reservations_sede_day_idx on public.reservations(sede_id, day);

-- El código de reserva (EMUSS-1055, EMUSS-1056, ...) lo genera la base de
-- datos, no el cliente — evita colisiones entre reservas concurrentes.
create sequence if not exists public.reservation_code_seq start 1055;

create or replace function public.set_reservation_code()
returns trigger
language plpgsql
as $$
begin
  if new.code is null or new.code = '' then
    new.code := 'EMUSS-' || nextval('public.reservation_code_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_reservation_code on public.reservations;
create trigger trg_set_reservation_code
  before insert on public.reservations
  for each row execute function public.set_reservation_code();

alter table public.reservations enable row level security;

-- Reservar sigue abierto a invitados (sin cuenta), igual que en el sitio público.
create policy "reservations_insert_anyone" on public.reservations
  for insert with check (true);

create policy "reservations_select_own_or_admin" on public.reservations
  for select using (
    client_id = auth.uid()
    or public.is_super_admin()
    or (public.is_admin() and sede_id = public.admin_sede_id())
  );

create policy "reservations_update_own_or_admin" on public.reservations
  for update using (
    client_id = auth.uid()
    or public.is_super_admin()
    or (public.is_admin() and sede_id = public.admin_sede_id())
  );

-- ============================================================
-- MANTENIMIENTO POR SEDE
-- ============================================================
create table if not exists public.maintenance_status (
  sede_id text primary key references public.sedes(id),
  on_maintenance boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.maintenance_status enable row level security;

create policy "maintenance_select_admin" on public.maintenance_status
  for select using (public.is_admin());
create policy "maintenance_upsert_admin" on public.maintenance_status
  for insert with check (public.is_admin());
create policy "maintenance_update_admin" on public.maintenance_status
  for update using (public.is_admin());

-- ============================================================
-- MODO PÁNICO (fila única)
-- ============================================================
create table if not exists public.panic_state (
  id int primary key default 1,
  active boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint panic_state_singleton check (id = 1)
);
insert into public.panic_state (id, active) values (1, false) on conflict (id) do nothing;

alter table public.panic_state enable row level security;

create policy "panic_select_admin" on public.panic_state
  for select using (public.is_admin());
create policy "panic_update_admin" on public.panic_state
  for update using (public.is_admin());

-- ============================================================
-- REGISTRO DE ACTIVIDAD (feed del panel admin)
-- ============================================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

create policy "activity_logs_select_admin" on public.activity_logs
  for select using (public.is_admin());
create policy "activity_logs_insert_admin" on public.activity_logs
  for insert with check (public.is_admin());

-- ============================================================
-- "AVÍSAME SI SE LIBERA UN CUPO"
-- ============================================================
create table if not exists public.notify_requests (
  id uuid primary key default gen_random_uuid(),
  sede_id text not null references public.sedes(id),
  sede_name text not null,
  time text not null,
  day int not null,
  contact text not null,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notify_requests enable row level security;

create policy "notify_requests_insert_anyone" on public.notify_requests
  for insert with check (true);
create policy "notify_requests_select_admin" on public.notify_requests
  for select using (public.is_admin());

-- ============================================================
-- PRIMER SUPER ADMIN
-- ============================================================
-- 1) Crea el usuario desde Authentication > Users > Add user en el dashboard
--    (o con el flujo de registro de la app) usando el correo del admin.
-- 2) Copia su UID y corre esto reemplazando los valores:
--
-- insert into public.admin_users (id, nombre, correo, rol, sede_id) values
--   ('UID-DEL-USUARIO', 'Rosa Delgado', 'rosa.delgado@emuss.pe', 'Super Admin', null);
