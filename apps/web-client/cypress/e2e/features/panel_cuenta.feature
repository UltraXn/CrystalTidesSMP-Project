# language: es
Característica: Panel de Control del Usuario y Configuración de Cuenta

  Escenario: Navegación entre pestañas del panel de cuenta
    Dado que accedo a mi panel de cuenta en "/account"
    Cuando la vista de la cuenta se carga correctamente
    Entonces se debe mostrar la pestaña principal "overview" con los datos del jugador
    Cuando cambio a la pestaña "profile"
    Entonces se debe mostrar el formulario de personalización de perfil
    Cuando cambio a la pestaña "connections"
    Entonces se deben mostrar las opciones de vinculación de Minecraft y Discord

  Escenario: Generación de código de vinculación de Minecraft
    Dado que estoy en la pestaña "connections" del panel de cuenta "/account?tab=connections"
    Cuando presiono el botón para generar un nuevo código de vinculación
    Entonces el sistema debe mostrar un código de 6 caracteres para usar en el comando "/link" in-game

  Escenario: Edición de la biografía y perfil público
    Dado que estoy en la pestaña "profile" del panel de cuenta "/account?tab=profile"
    Cuando actualizo mi biografía a "Explorador veterano de CrystalTides"
    Y guardo los cambios del perfil
    Entonces el sistema debe confirmar que el perfil fue actualizado con éxito
