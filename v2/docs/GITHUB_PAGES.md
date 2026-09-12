# GitHub Pages

URL pública: https://luiste1.github.io/proyecto-emuss/

Acceso administrativo: https://luiste1.github.io/proyecto-emuss/admin/login/

La V2 se publica desde la carpeta `v2/` del repositorio `LuisTE1/proyecto-emuss`. El código anterior de la raíz se conserva. El workflow `.github/workflows/deploy.yml` instala con Node 22, valida lint y pruebas unitarias, compila V2 y publica únicamente `v2/dist` mediante GitHub Pages.

`npm run build:pages` configura `/proyecto-emuss/` como base de recursos y rutas. Genera entradas HTML para las rutas estáticas y `404.html` para los comprobantes con código dinámico. La URL y sus parámetros de autenticación se conservan. Los enlaces de correo y recuperación incluyen el directorio de Pages.

Supabase Auth admite los retornos públicos y locales. `APP_URL` de las Edge Functions apunta al sitio público. El proveedor de correo transaccional continúa pendiente de configuración.

La copia publicada contiene `.env.production` con **solo** la URL de Supabase y la clave pública `anon`, que también forma parte del JavaScript del navegador. Las credenciales privilegiadas, contraseña del administrador, archivos locales de despliegue y `node_modules` quedan fuera de la publicación.

Referencia: [despliegue estático de Vite](https://vite.dev/guide/static-deploy.html#github-pages).
