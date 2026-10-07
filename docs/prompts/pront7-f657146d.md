\# Prompt final — Dashboard admin, accesos y cuenta de cliente



Pégalo completo en Claude Design. Cada sección indica su NIVEL DE FIDELIDAD:

\- 🟢 \*\*FUNCIONAL\*\* — debe funcionar de verdad con los datos mock (crear, leer,

&#x20; actualizar, buscar, cancelar).

\- 🟡 \*\*VISUAL CONVINCENTE\*\* — se ve y se siente real, pero no requiere backend real

&#x20; ni automatización en segundo plano (ej. no hay envío de emails de verdad).



\---



\## Prompt



\### 0. Actualiza los horarios (mock data) con los bloques reales confirmados



Reemplaza los bloques horarios de Ferrero y Chacarilla por estos (vienen del sistema

municipal real, son más confiables que estimaciones anteriores):



```

Lun-Mié-Vie: 05:00-08:00 / 12:00-14:00 / 19:00-22:00

Mar-Jue:     05:00-08:00 / 13:00-15:00 / 19:00-22:00

Sábado:      05:00-08:00 / 13:00-18:00

Domingo:     05:00-13:00

```



Dentro de cada bloque, genera slots reservables de 1 hora (ej. el bloque 05:00-08:00

genera 3 slots: 05:00-06:00, 06:00-07:00, 07:00-08:00), cada uno con capacidad de 3

personas por carril, tal como ya está definido en el modelo actual.



\---



\### 1. 🟢 Panel de administración tipo Business Analytics



\*\*KPIs principales (tarjetas arriba):\*\*

\- Reservas totales del día / semana / mes (con selector de rango).

\- % de ocupación promedio por sede.

\- Ingresos estimados (suma de tarifas de reservas confirmadas).

\- Incidencias activas.



\*\*Gráficos (usa un estilo tipo dashboard de analítica: barras y líneas):\*\*

\- Reservas por sede (barras comparativas).

\- Tendencia de reservas por día en el rango seleccionado (línea).

\- Ocupación por franja horaria (qué horas son las más demandadas).



\*\*Tabla de reservas (funcional):\*\*

\- Lista de todas las reservas con columnas: código de reserva, nombre, DNI, sede,

&#x20; fecha, hora, cantidad de personas, estado.

\- Barra de búsqueda que filtra en tiempo real por \*\*código, nombre o DNI\*\*.

\- Botón "Cancelar" por fila — al cancelar, libera el/los cupos correspondientes en

&#x20; el carril (esto debe reflejarse también en la vista de disponibilidad pública).

\- Botón "Exportar a Excel" de la tabla filtrada.



\*\*Crear reserva manualmente desde el dashboard:\*\*

\- Botón "+ Nueva reserva" que abre el mismo formulario de reserva (sede, fecha,

&#x20; horario, cantidad de personas, datos del cliente), pero sin el contador de

&#x20; bloqueo temporal (el admin la confirma directo).



\---



\### 2. 🟡 Gestión de accesos (RBAC) — interfaz visual, sin autenticación real



Una sección dentro del panel admin llamada "Gestión de accesos":

\- Lista de usuarios administradores/encargados (mock, 4-5 ejemplos).

\- Cada uno tiene un rol: \*\*"Encargado de sede"\*\* (acceso solo a su sede asignada,

&#x20; seleccionable de un dropdown) o \*\*"Super Admin"\*\* (acceso a todas las sedes y a

&#x20; esta misma sección de gestión de accesos).

\- Botón "+ Agregar administrador" con un formulario simple (nombre, correo, rol,

&#x20; sede asignada si aplica).

\- No es necesario implementar login/autenticación real — esta pantalla es para

&#x20; mostrar el concepto de control de accesos, no para que efectivamente restrinja

&#x20; el acceso a otras pantallas del prototipo.



\---



\### 3. 🟡 Cuenta de cliente (sin login/contraseña — búsqueda por DNI o teléfono)



En vez de un sistema de login con contraseña (que añadiría complejidad de

autenticación real), implementa un acceso simple:

\- Botón "Mis reservas" visible en el header.

\- El cliente ingresa su DNI o teléfono (el mismo que usó al reservar).

\- Se muestra una vista personal con:

&#x20; - Historial de sus reservas (pasadas y próximas).

&#x20; - Un dato simple tipo "Has venido 4 veces este mes" (calculado sobre los datos

&#x20;   mock).

&#x20; - Botón para cancelar una reserva próxima.



\*\*Alerta de disponibilidad (visual, sin automatización real):\*\*

\- En un horario lleno, botón \*\*"Avisarme si se libera un cupo"\*\*.

\- Al hacer clic, pide correo o teléfono y muestra una confirmación tipo "Te

&#x20; avisaremos apenas se libere un cupo en este horario" — no requiere que el envío

&#x20; real ocurra, es para mostrar el concepto en la demo.



\---



\### Requisitos técnicos

\- Todo en React, completamente responsive (mobile, tablet, desktop) — el panel

&#x20; admin y el dashboard de analítica también deben adaptarse bien a pantallas

&#x20; pequeñas (tablas con scroll horizontal o vista de tarjetas en móvil).

\- Mantén la paleta y dirección de arte ya definidas (azul institucional saturado,

&#x20; sombras tipo tarjeta flotante, estados verde/ámbar/rojo).

\- No implementes autenticación real, backend real, ni envío real de

&#x20; correos/notificaciones — todo funciona sobre datos simulados en memoria.

