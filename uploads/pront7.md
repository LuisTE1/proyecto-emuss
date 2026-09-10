\# Prompt consolidado — Mejoras finales al sistema de reservas EMUSS



Este prompt reúne TODOS los ajustes pendientes en un solo bloque. Pégalo completo en

Claude Design para aplicar todo de una vez sobre el proyecto que ya existe. No

rediseñes ni agregues nada fuera de lo descrito aquí.



\---



\## Prompt



Aplica estos ajustes sobre el sistema de disponibilidad y reserva de carriles de

piscinas EMUSS que ya está construido. Mantén el layout, paleta, calendario, modo

accesible y panel de administración exactamente como están — estos cambios son solo

sobre el modelo de capacidad del carril y el formulario de reserva.



\### 1. Cambia el modelo de capacidad: de "carril binario" a "capacidad por persona"



Actualmente un carril se muestra como Disponible / Reservado (binario). Cámbialo para

reflejar lo que la propia plataforma promete en la sección de beneficios ("máximo 3

nadadores por carril"):



\- Cada carril tiene \*\*capacidad de 3 personas\*\*.

\- El estado visual se calcula así:

&#x20; - 0 personas ocupando → \*\*Disponible\*\* (verde)

&#x20; - 1-2 personas ocupando, quedan cupos → \*\*Quedan cupos\*\* (verde, con el número

&#x20;   exacto: ej. "2 de 3 lugares libres")

&#x20; - 3 personas ocupando, o alguien lo marcó como exclusivo → \*\*Reservado\*\* (rojo/gris)

&#x20; - Alguien completando el formulario en ese momento → \*\*Reservando...\*\* (ámbar,

&#x20;   con el contador de 3-5 minutos como ya está definido)



\### 2. Ajusta el modal de reserva con estas opciones nuevas



Agrega, antes del formulario de datos personales:

\- \*\*"¿Cuántas personas van contigo?"\*\* — selector numérico (1, 2 o 3), limitado a

&#x20; los cupos que queden libres en ese carril.

\- \*\*Toggle "Quiero el carril solo para mi grupo (exclusivo)"\*\* — si se activa, el

&#x20; carril se marca como lleno (ocupa las 3 plazas) sin importar cuántas personas

&#x20; reales vayan. Si no se activa, las plazas restantes del carril siguen disponibles

&#x20; para que otros usuarios se sumen.



\### 3. Alinea los campos con el sistema municipal real (piscina libre, no academias)



En la tarjeta/modal de cada horario, agrega:

\- \*\*"Tiempo: 1 hora"\*\* explícito.

\- \*\*Doble tarifa\*\*: "Vecino Surco" y "Público general", con los montos reales por

&#x20; sede (ej. Ferrero: S/20 vecino / S/40 regular. Chacarilla: S/35 vecino / S/70

&#x20; regular). El precio final se calcula multiplicando por la cantidad de personas

&#x20; seleccionada (si no es exclusivo) o se cobra el precio fijo del carril completo

&#x20; (si es exclusivo).

\- Cambia el botón principal de "Confirmar reserva" a \*\*"Agregar al carrito"\*\*, con

&#x20; un paso final de \*\*"Confirmar reserva"\*\* — mismo lenguaje de dos pasos que usa el

&#x20; sistema real.



No agregues pestañas ni lógica de Academia, Aquaeróbicos o Aquaterapia — el alcance

de este proyecto es solo "piscina libre" por hora.



\### 4. Confirma o implementa el recomendador de sede alternativa



Cuando un horario aparece lleno (0 cupos o marcado exclusivo), debe mostrarse un

mensaje tipo: \*"Este horario está lleno en \[Sede X]. \[Sede Y] tiene \[N] lugares

libres a las \[hora], a \[tiempo estimado] de distancia."\* con un botón que lleve

directo a esa sede y horario. Verifica que esto ya funcione; si no, impleméntalo.



\### Qué NO hacer

\- No agregues lista de espera, cancelaciones parciales de reservas grupales, ni

&#x20; pagos divididos — quedan fuera del alcance por tiempo.

\- No cambies el layout general, el calendario, el modo accesible ni el panel admin.

