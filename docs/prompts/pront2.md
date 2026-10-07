\# Prompt de mejora — Iterar sobre el proyecto EMUSS ya generado



Este prompt es para AJUSTAR el proyecto que ya tienen (no regenerar desde cero).

Pégalo en Claude Design para aplicar estas 3 mejoras puntuales.



\---



\## Prompt



Toma el proyecto actual (sistema de disponibilidad y reserva de carriles de piscinas

EMUSS) y aplica estos 3 ajustes, sin rediseñar lo que ya funciona:



\### 1. Corrige los datos de ejemplo (mock data) a las 4 sedes reales de EMUSS



Las sedes actuales (Chorrillos, Barranco, Surco, San Isidro) son de distritos

incorrectos. Reemplázalas por las 4 sedes reales de EMUSS, todas en Santiago de Surco.

Las primeras 3 se muestran con el flujo completo de reserva de carriles; la cuarta

(OMAPED) se muestra de forma distinta, ver nota abajo.



\- \*\*Sede Chacarilla\*\* (Complejo Deportivo Chacarilla) — Jirón Montemar 190, Urb.

&#x20; Chacarilla del Estanque, Surco. Cuenta con accesibilidad motriz (silla elevadora

&#x20; para ingreso al agua). Dos piscinas temperadas.

\- \*\*Sede Ferrero\*\* (Coliseo Ferrero) — Av. Raúl Ferrero Nº 155, Surco. Piscina

&#x20; semiolímpica temperada + gimnasio.

\- \*\*Sede Montjoy\*\* (Coliseo Julio Montjoy) — Jirón Arica 581, Surco. Piscina +

&#x20; canchas de vóley y básquet (puede tener menos horarios de ejemplo, ya que su

&#x20; tarifario detallado aún no está confirmado por la empresa).

\- \*\*OMAPED Loma Amarilla\*\* — Av. Monte de los Olivos 679, Parque Ecológico Loma

&#x20; Amarilla, Surco. Piscina terapéutica y temperada (15×8 m), orientada a personas

&#x20; con discapacidad, con clases de natación adaptadas y terapia física. Esta sede NO

&#x20; debe mostrarse con el mismo flujo de "reservar carril por hora" que las otras 3 —

&#x20; muéstrala en la lista de sedes con una etiqueta distinta, por ejemplo "Servicio

&#x20; terapéutico — requiere evaluación previa", con un botón "Más información /

&#x20; Contactar" en vez de "Reservar". Esto refleja que es un servicio especializado

&#x20; con reglas propias, no de uso libre.



Actualiza también la sección "Nuestras piscinas" (mapas) con estas mismas 4 sedes y

sus direcciones reales.



\### 2. Ajusta el formulario de reserva para que coincida con los campos del sistema municipal actual



En el modal de reserva, reemplaza el campo único "Nombre completo" y ajusta así:

\- Agregar selector \*\*"Tipo de documento"\*\* (opciones: DNI, Carné de extranjería,

&#x20; Pasaporte) antes del campo de número de documento.

\- Dividir el nombre en \*\*"Nombres"\*\*, \*\*"Apellido paterno"\*\*, \*\*"Apellido materno"\*\*.

\- Mantener teléfono y correo electrónico tal como están.

\- NO agregar campo de género ni de contraseña — este flujo es de reserva rápida sin

&#x20; necesidad de crear una cuenta (guest checkout), a diferencia del registro completo

&#x20; del sistema municipal.



\### 3. Agrega un "Recomendador de cupo alternativo" (sin IA generativa, solo lógica de comparación)



Cuando un usuario intenta reservar un horario que aparece como "Reservado" (lleno)

en una sede, el sistema debe mostrar automáticamente, debajo de ese horario, una

sugerencia con el próximo horario disponible más cercano en cualquiera de las otras

sedes, comparando por hora y por sede.



\*\*Comportamiento esperado:\*\*

\- El usuario hace clic en un horario lleno (o pasa el cursor / toca en móvil).

\- Aparece una tarjeta o banner corto: \*"Este horario está lleno en \[Sede X]. \[Sede Y]

&#x20; tiene \[N] carriles libres a las \[hora], a \[distancia aproximada] de aquí."\*

\- Incluye un botón "Ver y reservar en \[Sede Y]" que lleva directo a esa sede con el

&#x20; horario correspondiente ya resaltado.

\- La lógica es simple: comparar los horarios de todas las sedes en la misma fecha,

&#x20; encontrar el bloque con disponibilidad más cercano en tiempo a lo que el usuario

&#x20; buscaba, priorizando la sede más cercana si hay empate.

\- Usa datos de distancia aproximados y fijos entre las sedes (no requiere geolocalización

&#x20; real ni APIs externas — puede ser un valor estático tipo "a 15 min" según la sede).



\*\*Diseño visual de esta función:\*\*

\- Debe sentirse como parte natural del flujo, no como un pop-up intrusivo — un banner

&#x20; o tarjeta secundaria con el mismo estilo visual (colores, sombras, tipografía) que

&#x20; el resto del sistema.

\- Mantén la misma paleta y dirección de arte ya definida (azul institucional

&#x20; saturado, sombras tipo tarjeta flotante, estados en verde/ámbar/rojo).



\### Qué no tocar

\- No modifiques el layout general, el calendario, el modo accesible, ni el panel de

&#x20; administración — ya están resueltos y funcionan bien.

\- No agregues chatbot, IA conversacional, ni geolocalización real.

