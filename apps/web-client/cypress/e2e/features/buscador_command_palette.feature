# language: es
Característica: Buscador Global Command Palette y Navegación Rápida

  Escenario: Apertura de la Command Palette mediante atajo de teclado
    Dado que navego a la página principal en "/"
    Cuando presiono la combinación de teclas "Control+k"
    Entonces la modal interactiva de Command Palette debe desplegarse en pantalla

  Escenario: Búsqueda rápida y navegación a secciones
    Dado que la Command Palette está abierta en "/"
    Cuando escribo "Reglas" en el cuadro de búsqueda global
    Y presiono la tecla Enter o selecciono el resultado
    Entonces la aplicación debe navegar inmediatamente a la página de reglas "/rules"
