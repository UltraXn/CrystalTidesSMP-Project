# language: es
Característica: Muro de Comentarios en Perfiles Públicos de Usuarios

  Escenario: Publicación de comentario en el perfil de otro jugador
    Dado que visito el perfil público de un usuario en "/u/Nacho"
    Cuando la sección del Muro de Comentarios es visible
    Y escribo el mensaje "¡Excelente construcción de base en el Nether!" en la caja de comentarios
    Y presiono el botón de Publicar Comentario
    Entonces el comentario debe aparecer inmediatamente en la lista de comentarios del muro

  Escenario: Rechazo de comentarios vacíos
    Dado que estoy en el perfil público de "/u/Nacho"
    Cuando intento publicar un comentario con el campo de texto vacío
    Entonces el botón de publicar debe mantenerse deshabilitado o mostrar validación
