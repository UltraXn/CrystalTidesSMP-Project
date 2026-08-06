# language: es
Característica: Panel de Administración y Seguridad 2FA TOTP

  Escenario: Solicitud de verificación 2FA para ingresar al Panel Admin
    Dado que intento acceder al panel de administración en "/admin"
    Cuando la cuenta requiere verificación de doble factor
    Entonces el sistema debe desplegar el modal de verificación 2FA "Admin2FAModal"
    Y el acceso al panel se mantiene bloqueado hasta ingresar el código de 6 dígitos

  Escenario: Navegación por los módulos de gestión del Staff Hub
    Dado que estoy autenticado en el panel de administración "/admin"
    Cuando selecciono la sección de "Noticias"
    Entonces el panel debe mostrar el formulario y gestor de noticias
    Cuando cambio a la sección "Audit Log"
    Entonces se deben listar las entradas inmutables del registro de auditoría
