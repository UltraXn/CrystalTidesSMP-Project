# 🛡️ Informe de Auditoría de Seguridad - CrystalTides

**Fecha:** 2026-01-09
**Estado General:** 🟠 MODERADO (Acciones de remediación iniciadas)

## 🚨 Hallazgos Críticos Identificados

### 1. Ataques de Fuerza Bruta en Autenticación
- **Vulnerabilidad**: Las rutas `/api/auth/login` y `/api/auth/register` no tenían límites de peticiones.
- **Acción**: ✅ **CORREGIDO**. Se aplicó el middleware `authLimiter` restringiendo a 20 intentos por cada 15 minutos.

### 2. Secreto de Admin 2FA Expuesto/Predecible
- **Vulnerabilidad**: `twoFactorService.ts` utilizaba un secreto hardcodeado por defecto (`dev_secret_CHANGE_IN_PROD_12345`).
- **Acción**: ✅ **CORREGIDO**. Se implementó generación dinámica segura usando `crypto.randomBytes(64)` como respaldo si no existe la variable de entorno.

### 3. Fuga de Secretos en el Historial de Git
- **Vulnerabilidad**: Existen archivos `.env` y claves JSON en commits antiguos del repositorio.
- **Estado**: ⚠️ **PENDIENTE**. Se requiere ejecución de `git-filter-repo` para purgar el historial.

### 4. Escalada de Privilegios en Supabase
- **Vulnerabilidad**: Los usuarios podían editar su propio `role` desde el navegador.
- **Acción**: ✅ **CORREGIDO**. Se aplicó política RLS restrictiva que bloquea cambios en la columna `role`.

### 5. API del Bot Expuesta
- **Vulnerabilidad**: Endpoints de presencia sin seguridad.
- **Acción**: ✅ **CORREGIDO**. Se implementó Bearer Auth con token obligatorio.

## 🔍 Verificaciones Realizadas

| Área | Estado | Observaciones |
| :--- | :--- | :--- |
| **Inyección SQL** | ✅ SEGURO | Uso correcto de consultas parametrizadas en `mysql2`. |
| **Rate Limiting** | ✅ SEGURO | Aplicado globalmente y de forma estricta en acciones sensibles (Gacha, Tickets). |
| **XSS / Content Security** | ✅ SEGURO | Helmet.js está activo y configurado en el `app.ts`. |
| **2FA Implementation** | ✅ SEGURO | Uso de Speakeasy con validación estricta de tokens. |

## 🛠️ Próximos Pasos (Deuda Técnica)

1. **Purga de Historial**: Ejecutar limpieza de Git para eliminar rastro de secretos antiguos.
2. **Validación Zod**: Migrar todos los controladores del servidor a validaciones de esquema con Zod (actualmente se confía en el tipado de TypeScript que no valida en tiempo de ejecución).
3. **Audit In-Game**: Realizar auditoría de permisos de LuckPerms para asegurar que el `CrystalBridge` no pueda ejecutar comandos de consola no autorizados fuera de los Owners.
