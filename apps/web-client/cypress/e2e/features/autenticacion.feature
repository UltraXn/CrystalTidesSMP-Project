# language: es
Característica: Autenticación de Usuarios y Seguridad Honeypot

  Escenario: Registro de usuario legítimo con datos válidos
    Dado que navego al formulario de registro en "/register"
    Cuando ingreso el usuario "jugador_test", correo "test@crystaltidessmp.net" y contraseña "Password123!"
    Y dejo el campo trampa de Honeypot vacío
    Y envío el formulario de registro
    Entonces la aplicación procesa la solicitud de registro correctamente

  Escenario: Intento de inicio de sesión con credenciales incorrectas
    Dado que navego a la página de inicio de sesión en "/login"
    Cuando ingreso el correo "usuario_invalido@ejemplo.com" y la contraseña "ClaveIncorrecta99"
    Y presiono el botón de Iniciar Sesión
    Entonces el sistema debe mostrar un mensaje de error de credenciales

  Escenario: Detección y bloqueo de bot por llenado del campo Honeypot
    Dado que navego al formulario de registro en "/register"
    Cuando un bot completa el campo invisible "confirm_email" con "bot_spammer@malicioso.com"
    Y envía la solicitud de registro
    Entonces el backend debe interceptar al bot con una trampa Honeypot
