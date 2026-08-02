# 🚀 Documentación de CI/CD - CrystalTides SMP

Nuestro pipeline de integración y despliegue continuo (CI/CD) está diseñado para desplegar automáticamente nuestros servicios en **Google Cloud Run**, asegurando escalabilidad y alta disponibilidad.

## 🛠️ Flujo de Trabajo (Workflow)

El archivo maestro es `.github/workflows/deploy.yml`. Se ejecuta automáticamente en cada `push` a la rama `main`, o manualmente mediante `workflow_dispatch` (exclusivo para la rama `main`). El disparo automático y manual a producción está completamente restringido a la rama `main` por motivos de seguridad.

### Arquitectura de Despliegue

Utilizamos **Google Artifact Registry** para almacenar las imágenes Docker y **Cloud Run** para la ejecución. Las imágenes se etiquetan con `:latest` y con el hash inmutable del commit (`:${{ github.sha }}`). Los despliegues en Cloud Run referencian explícitamente la versión inmutable basada en el hash del commit.

Para ejecuciones manuales (`workflow_dispatch`), el usuario puede seleccionar opcionalmente qué servicios específicos desplegar (Backend, Frontend, o Bot) mediante parámetros booleanos en la interfaz de GitHub Actions.

1.  **Backend (API)**: Servicio HTTP con auto-scaling.
2.  **Frontend (Web)**: Servido via Nginx en contenedor, optimizado para React SPA.
3.  **Discord Bot**: Servicio persistente (`min-instances: 1`) para mantener la conexión WebSocket.

### Pasos del Pipeline

Para cada servicio (Backend, Frontend, Bot), el flujo es similar:

1.  **Checkout**: Clonado del repositorio (incluyendo subguías).
2.  **Auth**: Autenticación en Google Cloud Platform usando `workload_identity_provider` o credenciales JSON.
3.  **Docker Build**:
    - Construcción de la imagen desde el `Dockerfile` correspondiente.
    - Inyección de argumentos de construcción (`--build-arg`) para el frontend (Variables VITE públicas).
4.  **Push**: Subida de la imagen a `us-central1-docker.pkg.dev/crystaltides-prod/...`.
5.  **Deploy**: Actualización de la revisión en Cloud Run con las nuevas variables de entorno.

## 🔑 Secretos y Variables

Para que el despliegue funcione, Github Actions necesita estos secretos:

### Infraestructura (Críticos)

| Secreto           | Descripción                                                                                       |
| :---------------- | :------------------------------------------------------------------------------------------------ |
| `GCP_CREDENTIALS` | JSON de la cuenta de servicio de IAM con permisos `Cloud Run Admin` y `Artifact Registry Writer`. |
| `PAT_TOKEN`       | Token de acceso personal de GitHub para clonar submódulos privados (si los hubiera).              |

### Aplicación (Runtime)

| Secreto                     | Descripción                                                                  |
| :-------------------------- | :--------------------------------------------------------------------------- |
| `ENV_FILE`                  | Contenido completo del `.env` de producción para el Backend (DB, Keys, etc). |
| `VITE_SUPABASE_URL`         | URL pública de Supabase.                                                     |
| `VITE_SUPABASE_ANON_KEY`    | Key pública de Supabase.                                                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Key administrativa (Solo Backend).                                           |

## 📦 Servicios Desplegados

| Servicio     | Dockerfile Path               | Cloud Run Service      | Notas                                                                    |
| :----------- | :---------------------------- | :--------------------- | :----------------------------------------------------------------------- |
| **Backend**  | `apps/web-server/Dockerfile`  | `crystaltides-backend` | Multi-stage, puerto **3001**, HEALTHCHECK `/api/system/health`.          |
| **Frontend** | `apps/web-client/Dockerfile`  | `crystaltides-web`     | Multi-stage (nginx unprivileged **8080**). Variables VITE en build-time. |
| **Bot**      | `apps/discord-bot/Dockerfile` | `crystaltides-bot`     | Multi-stage non-root, `min-instances: 1`, health en `/health`.           |

## 🛡️ Notas de Seguridad

- Las imágenes se almacenan en un registro privado de Google.
- El Frontend se construye con los secretos de Supabase embebidos (son públicos por diseño), pero **nuevas** variables de entorno requieren re-deploy.
- El Bot utiliza una instancia mínima reservada para no perder eventos de Discord.
