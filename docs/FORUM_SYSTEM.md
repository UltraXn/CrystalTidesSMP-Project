# 🏛️ Sistema de Foros y Comunidad

El foro de CrystalTides es el núcleo social de la comunidad, permitiendo la comunicación estructurada entre jugadores y el equipo administrativo.

## 🗂️ Estructura del Foro

El contenido se organiza mediante una jerarquía de etiquetas y categorías:

- **Anuncios**: Solo lectura para usuarios regulares, usado por el Staff para noticias oficiales.
- **General**: Charlas sobre el servidor.
- **Sugerencias**: Sistema donde los jugadores proponen ideas.
- **Soporte/Reportes**: Espacio para ayuda técnica.

## 🖋️ Creación de Contenido

- **Soporte Markdown**: Los posts soportan formato **Markdown** (negritas, cursivas, listas, código), renderizado vía `MarkdownRenderer`.
- **Imágenes**: Integración con almacenamiento en la nube (Supabase Storage) para subir capturas optimizadas a WebP.
- **Encuestas**: Posibilidad de adjuntar una votación nativa o un enlace a encuesta de Discord.

## 💬 Interacción Social

- **Respuestas**: Hilos lineales cronológicos.
- **Notificaciones**: (En desarrollo) Alertas en la campana de notificaciones.

## 🛡️ Herramientas de Moderación (Staff)

Los moderadores (Rango Admin/Helper) cuentan con acciones directas en el hilo:

- **Pin (Fijar)**: Coloca el tema al inicio de la lista.
- **Lock (Cerrar)**: Deshabilita el formulario de respuesta para usuarios no-staff.
- **Delete (Eliminar)**: Elimina el tema o comentarios específicos.

## 🤖 Integración con Discord

El backend (`discordService.ts`) envía automáticamente un **Webhook** al canal configurado cuando se crea **cualquier nuevo tema**, maximizando la visibilidad de la actividad del foro.

---

_Documentación generada el 25 de diciembre de 2025._
