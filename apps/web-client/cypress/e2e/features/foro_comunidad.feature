# language: es
Característica: Foro de Discusión y Comentarios de la Comunidad

  Escenario: Exploración de categorías y temas del foro
    Dado que accedo a la página principal del foro en "/forum"
    Cuando la vista carga las categorías disponibles
    Entonces se deben listar las secciones de "General", "Guías" y "Anuncios"

  Escenario: Creación de un nuevo hilo de discusión
    Dado que estoy en la página de creación de hilos en "/forum/create"
    Cuando escribo el título "Guía rápida para derrotar al Ignis"
    Y selecciono la categoría "general"
    Y agrego el cuerpo de contenido en Markdown
    Y publico el tema
    Entonces el hilo debe crearse y redirigir a la vista del tema
