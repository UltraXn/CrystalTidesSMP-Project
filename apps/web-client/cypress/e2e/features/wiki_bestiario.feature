# language: es
Característica: Bestiario y Filtros de Mobs en la Wiki

  Escenario: Filtrar criaturas del mod Aquaculture 2 en la Wiki
    Dado que navego a la página de la Wiki en "/wiki"
    Cuando busco "Aquaculture 2" en el cuadro de búsqueda
    Entonces el Bestiario debe mostrar la criatura "Great Thrasher (Tiburón Ecolocalizador)"

  Escenario: Filtrar Mobs Hostiles en el Panel de Administración
    Dado que estoy en el Panel Administrativo en "/admin"
    Cuando selecciono la categoría "mobs_hostiles" en los filtros
    Entonces el Panel debe listar solo los mobs con la etiqueta "mobs_hostiles"
