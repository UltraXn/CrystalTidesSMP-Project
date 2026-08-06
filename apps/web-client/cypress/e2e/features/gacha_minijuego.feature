# language: es
Característica: Minijuego KilluCoin Gacha y Recompensas

  Escenario: Visualización del panel de Gacha y saldo de KilluCoins
    Dado que accedo a la sección del Gacha en "/gacha"
    Cuando la interfaz carga los datos del jugador
    Entonces se debe mostrar el contenedor del minijuego Arcade Gacha
    Y debe mostrarse el selector de tiradas por KilluCoins

  Escenario: Restricción de tirada cuando la cuenta de Minecraft no está vinculada
    Dado que estoy en la página del Gacha en "/gacha" sin vincular cuenta de Minecraft
    Cuando presiono el botón de tirar en la ruleta
    Entonces el sistema debe mostrar una alerta notificando "ACCOUNT_NOT_LINKED"
