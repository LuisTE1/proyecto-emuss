Actúa como un Ingeniero de Software Senior y Diseñador UI/UX Experto. Genera una interfaz web moderna, limpia y profesional en un único archivo de React funcional, utilizando Tailwind CSS para los estilos. El proyecto debe ser una aplicación de una sola página (Single Page Application - SPA) con scroll suave, estructurada bajo un enfoque inclusivo y con optimización en tiempo real para la gestión de piscinas de EMUSS.



Sigue rigurosamente las siguientes especificaciones de diseño clonando una estructura moderna y limpia adaptada al negocio de natación:



=========================================

1\. DISEÑO DE INTERFAZ Y COMPONENTES (UI/UX)

=========================================

\- BARRA DE NAVEGACIÓN (Navbar): Fija en la parte superior, fondo blanco puro (#ffffff), sombra sutil. Logotipo a la izquierda "EMUSS" junto a un isotipo estilizado de una ola o nadador en azul cian. Enlaces a la derecha con efecto hover: "Inicio", "Beneficios Inclusivos", "Disponibilidad de Carriles", "Nuestras Piscinas". Incluye un tag distintivo al lado: "HACKATON MVP".

\- CABECERA PRINCIPAL (Hero Section): Un fondo con degradado horizontal vibrante desde morado profundo, pasando por índigo, hasta azul cian brillante en el extremo derecho. Título centrado "Disponibilidad de Piscinas" en blanco con tipografía Sans-Serif gruesa (font-black) y subtítulo descriptivo abajo: "Consulta y reserva los carriles de nuestra red de complejos acuáticos en tiempo real".

\- SECCIÓN BENEFICIOS INCLUSIVOS: Estructura de 2 columnas sobre fondo blanco puro.

&#x20; \* Columna Izquierda: Título "EMUSS es para todos", textos persuasivos sobre natación inclusiva (ej. ¿Buscas un espacio seguro para rehabilitación física? ¿Quieres un carril de nado libre sin aglomeraciones? ¿Necesitas infraestructura adaptada para tu familia?). Frase de cierre en negrita: "Centralizamos nuestras piscinas para darte el espacio exacto que necesitas". Incluye una ilustración o icono representativo en un contenedor redondeado suave (bg-cyan-50) que diga "EMUSS INCLUSIVO".

&#x20; \* Columna Derecha: Cuadrícula (Grid 2x2) con 4 tarjetas de características independientes, esquinas muy redondeadas (rounded-2xl) y sombras suaves:

&#x20;   1. Tarjeta 1: Ícono de silla de ruedas/rampa. Título: "Accesibilidad Motriz". Descripción: "Complejos equipados con rampas de ingreso y elevadores hidráulicos para el agua".

&#x20;   2. Tarjeta 2: Ícono de cronómetro/usuario. Título: "Nado Libre Sin Estrés". Descripción: "Garantizamos un máximo de 3 nadadores por carril para entrenamientos óptimos".

&#x20;   3. Tarjeta 3: Ícono de un niño/flotador. Título: "Piscinas Paternas". Descripción: "Espacios de baja profundidad ideales para matronatación y niños pequeños".

&#x20;   4. Tarjeta 4: Ícono de monedas/ahorro. Título: "Reserva Flexible". Descripción: "Separa bloques de entrenamiento desde 30 minutos sin mensualidades forzosas".

\- TABLERO DE DISPONIBILIDAD (Grilla Comparativa Horizontal): 

&#x20; \* Encabezado con selector de fecha simulado en tarjeta blanca ("Miércoles 09 de Setiembre del 2026") con un icono de calendario al lado.

&#x20; \* Una alerta visual superior destacada en fondo amarillo tenue que diga: "⏳ ESTADOS EN AMARILLO: TIENEN 3 MIN PARA LIBERARSE SI NO SE COMPLETA LA COMPRA".

&#x20; \* Barra de Filtros Inclusivos rápidos (Smart Tags): "🌐 Ver Todo", "👶 Zona Infantil", "🏊 Carril Adultos", "♿ Accesible Motriz".

&#x20; \* Grilla Horizontal de Sedes: 4 columnas paralelas fijas (Sede Chorrillos, Sede Barranco, Sede Surco, Sede San Isidro) representadas como tarjetas verticales. Cada una con una cabecera color índigo oscuro y bloques de horarios en su interior con 3 estados estrictos:

&#x20;   1. Estado DISPONIBLE: Fondo verde tenue, borde verde, texto verde. Incluye el emoji ✔️ y el texto "DISPONIBLE". Al hacer clic simula el flujo de reserva con un alert.

&#x20;   2. Estado RESERVADO: Fondo rojo tenue, texto rojo. Incluye el emoji 🔒 y el texto "RESERVADO". Botón completamente bloqueado (cursor-not-allowed) con opacidad reducida.

&#x20;   3. Estado EN RESERVA: Fondo amarillo/ámbar tenue, texto amarillo/ámbar. Incluye el emoji ⏳, el texto "EN RESERVA" y la animación de parpadeo (animate-pulse). Representa el bloqueo temporal por concurrencia.

\- INTEGRACIÓN DE MAPAS Y PIE DE PÁGINA (Footer): 

&#x20; \* Bloque de contacto centrado destacado ("¿Tienes alguna consulta adicional? Escríbenos al Centro de Atención" con enlace en color magenta y subrayado).

&#x20; \* Fila de 3 columnas para los complejos físicos, cada una mostrando su nombre de Sede, dirección exacta y un contenedor cuadrado (aspect-square) con un iframe real de Google Maps incrustado de fondo.

&#x20; \* Footer institucional limpio al fondo con redes sociales de EMUSS y la opción del "Libro de Reclamaciones" con el icono de un libro abierto.



=========================================

2\. ARQUITECTURA DE FUNCIONAMIENTO Y LOGICA

=========================================

El prototipo debe implementar reactividad real mediante estados de React (useState):

\- INTERACTIVIDAD DEL MODAL DE COLA VIRTUAL: Al hacer clic en cualquier horario en estado "AMARILLO", abre un Modal superpuesto que dice dinámicamente el nombre de la Sede de EMUSS, el horario seleccionado, advierte en una alerta interna que hay "2 personas en espera de liberación por tiempo" y permite dar clic en un botón "Unirme a la lista". Al hacer clic en este, el modal cambia dinámicamente a una pantalla de éxito verde que confirma que ha sido registrado como el "Puesto #3 de la cola" y recibirá una alerta push/SMS si el comprador actual no finaliza su transacción en su ventana de 3 minutos.

\- REACTIVIDAD DE LOS FILTROS INCLUSIVOS: Al hacer clic en los Smart Tags superiores, la grilla debe ejecutar dinámicamente un filtrado en el frontend usando funciones nativas (.filter()) basadas en los tags de cada sede, ocultando instantáneamente las columnas que no cumplan con la infraestructura elegida.



Entrega el código de producción completo, limpio, modular y completamente funcional en un solo bloque, sin usar comentarios de marcador de posición ni omitir ninguna sección.



