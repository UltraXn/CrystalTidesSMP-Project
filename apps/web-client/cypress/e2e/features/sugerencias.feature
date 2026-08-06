# language: es
Característica: Sistema de Sugerencias de la Comunidad y Votación

  Escenario: Envío de una sugerencia con datos válidos
    Dado que navego a la sección de sugerencias en "/suggestions"
    Cuando abro el formulario de nueva sugerencia
    Y escribo el título "Añadir zonas seguras en nether" y descripción "Para evitar campeos en portales"
    Y selecciono la categoría "general"
    Y envío la sugerencia
    Entonces la sugerencia debe aparecer en el listado de sugerencias de la comunidad

  Escenario: Filtrado de sugerencias por estado
    Dado que estoy en la página de sugerencias en "/suggestions"
    Cuando selecciono el filtro de estado "aprobadas"
    Entonces la lista debe mostrar únicamente sugerencias con el estado correspondiente
