# EMUSS — Disponibilidad de Piscinas

La versión publicada en [GitHub Pages](https://luiste1.github.io/proyecto-emuss/) es ahora **EMUSS V2**, con código e instrucciones en [v2/README.md](v2/README.md). El código anterior de esta raíz se conserva como referencia; el workflow de Pages compila `v2/`.

Aplicación React (Vite + JavaScript) para la reserva de carriles en la red de
complejos acuáticos EMUSS: sitio público de disponibilidad/reservas, cuenta
de cliente y panel administrativo con analítica y gestión de accesos —
respaldados por un backend real en Supabase.

Migrada desde el diseño original en `legacy/` (HTML + runtime propio de
Claude Design) a una arquitectura **folder-by-feature**.

## Estructura

```
src/
  components/        Componentes visuales comunes (Navbar, Footer, Modal, avisos)
    layout/
    ui/
  features/          Una carpeta por sección principal de la app
    public-site/       Sitio público: hero, beneficios, disponibilidad, mapas y sus modales
    client-account/     Login/registro y "Mi cuenta" (resumen, notificaciones, reservas)
    admin-panel/        Panel admin: analítica, gestión de accesos y sus modales
  hooks/             Estado de la aplicación (useEmussStore)
  services/          Acceso a datos: Supabase (auth, reservas, RBAC, ops) + lógica pura
  utils/             Utilidades de fecha/formato sin dependencias de React
  styles/            CSS global
supabase/
  migrations/        Schema SQL (tablas + Row Level Security)
  functions/          Edge Functions (correo de confirmación, alta de administradores)
```

- **services/** son las funciones de acceso a datos (Supabase) y la lógica de
  cálculo pura (disponibilidad de carriles, tarifas, exportación CSV). Los
  componentes nunca llaman a Supabase directamente.
- **hooks/useEmussStore** concentra el estado de la app y expone `state` +
  `actions`; internamente llama a `services/` (incluyendo las operaciones
  async contra Supabase) y mantiene una copia local para que la UI responda
  al instante.
- **features/** contiene selectores (`*Selectors.js`) que combinan `state` +
  `services` en los datos que cada componente necesita, y los componentes de
  presentación (JSX) que solo renderizan.

## Backend (Supabase)

La app necesita un proyecto de Supabase para funcionar (reservas, login,
panel admin). Sin uno configurado, verás una pantalla de "Backend no
conectado" con estos mismos pasos.

1. Crea un proyecto gratis en [supabase.com](https://supabase.com). Elige la
   región más cercana a donde vas a hacer la demo (para Perú/Sudamérica,
   **South America (São Paulo)** si aparece en la lista).
2. Abre el **SQL Editor** del proyecto y corre, en orden, los dos archivos de
   `supabase/migrations/`:
   - `0001_init.sql` — tablas base, RLS y siembra de sedes.
   - `0002_holds_and_realtime.sql` — el candado atómico por horario y las
     tablas que habilitan disponibilidad en vivo (ver "Tiempo real" abajo).
3. Copia `.env.example` a `.env` y completa con tu **Project URL** y **anon key**
   (Settings → API):
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. Crea tu primer **Super Admin**: en Authentication → Users → Add user, crea
   ese usuario; copia su UID y corre el `insert into admin_users (...)` que
   está comentado al final de `0001_init.sql`, reemplazando los valores.
5. `npm run dev` (o reinicia si ya estaba corriendo).

Con eso: el registro/login de clientes, las reservas (público y admin) con
candado anti-doble-reserva y disponibilidad en vivo, el panel de analítica,
mantenimiento, modo pánico, el feed de actividad y el alta de nuevos
administradores (Gestión de accesos → "+ Agregar administrador") ya
funcionan contra datos reales.

### Tiempo real (Realtime + candado por horario)

Reservar ya no es "insertar y listo": al tocar un horario disponible, el
frontend pide un **hold** vía RPC (`request_slot_hold`) — la base de datos
usa un *advisory lock* por `(sede, día, hora)` para que, si dos personas
tocan el mismo horario al mismo tiempo, Postgres las procese una por una en
vez de dejar pasar a ambas. Si el cupo ya no alcanza, la función rechaza con
`slot_full` **antes** de mostrar el formulario. Al confirmar, pasa lo mismo
otra vez (`create_reservation_with_lock`) por si el cupo cambió mientras la
persona llenaba el formulario.

Ese hold (y las reservas confirmadas, sin datos personales) se reflejan en
la tabla pública `slot_occupancy`, con **Realtime** habilitado — así que
cualquier pestaña abierta ve el carril pasar a "Reservando..." o
"Reservado" al instante, sin recargar. El feed de actividad del panel admin
sigue en polling cada 6s (no es crítico que sea instantáneo ahí).

Los holds vencidos dejan de contar automáticamente (se filtran por
`expires_at`), así que esto funciona aunque no actives `pg_cron` — activarlo
es opcional, solo hace que la limpieza sea más prolija (ver el comentario al
final de `0002_holds_and_realtime.sql`).

### Notificaciones

- **Correo**: la Edge Function `supabase/functions/send-reservation-email`
  ya está integrada (se llama al confirmar una reserva) pero necesita un
  proveedor de correo para enviar de verdad. Para activarla con
  [Resend](https://resend.com) (gratis hasta 3000 correos/mes):
  ```bash
  supabase secrets set RESEND_API_KEY=re_xxx
  supabase functions deploy send-reservation-email
  ```
  Sin esa clave configurada, la función responde `sent: false` sin romper
  el flujo de reserva — el correo queda "preparado" pero no se envía.
- **WhatsApp**: no está implementado. Requiere una cuenta de WhatsApp
  Business API (Meta) con aprobación de plantillas de mensaje, que toma
  días y no depende de tiempo de desarrollo.
- **Alta de administradores**: usa la Edge Function `admin-invite` (con el
  service role key, nunca expuesta al frontend) para crear el usuario de
  Auth + su fila en `admin_users` en un solo paso. Requiere desplegarla:
  ```bash
  supabase functions deploy admin-invite
  ```

### Qué sigue siendo una maqueta (sin conectar)

- El modal **"Editar (ABAC)"** en Gestión de accesos (alcance multi-sede +
  matriz de módulos permitidos) — hoy el RBAC real solo soporta rol + 1 sede.
- La pestaña **Notificaciones** de "Mi cuenta" (preferencias de canal + feed)
  — usa datos de ejemplo; el disparo real de avisos (cupo liberado, horario
  ocupado) todavía no está conectado a los datos de Supabase.

## Desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
```
