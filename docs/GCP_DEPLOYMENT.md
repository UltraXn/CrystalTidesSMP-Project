# ☁️ Guía de Despliegue en Google Cloud Platform (GCP)

Este plan detalla cómo llevar **CrystalTides** a producción utilizando una arquitectura **Serverless** y **Contenerizada** en Google Cloud.

## 🏗️ Arquitectura Propuesta

Utilizaremos **Google Cloud Run** para todos los servicios. Es una solución "Serverless" que ejecuta contenedores Docker, escala automáticamente y cobra solo por uso (o por instancia activa).

| Servicio          | Tecnología           | Estrategia GCP | Notas                                                                      |
| :---------------- | :------------------- | :------------- | :------------------------------------------------------------------------- |
| **Frontend**      | React + Vite + Nginx | **Cloud Run**  | Servir estáticos con Nginx en contenedor.                                  |
| **Backend**       | Express (Node.js)    | **Cloud Run**  | API REST pública. Escala a cero si no hay uso.                             |
| **Discord Bot**   | Bun / Discord.js     | **Cloud Run**  | **Importante**: Configurar "min-instances: 1" para mantenerlo online 24/7. |
| **Base de Datos** | MySQL / Postgres     | **Externa**    | Supabase (Postgres) y Pterodactyl (MySQL) se mantienen externos.           |

---

## 📋 Prerequisitos

1.  **Cuenta Google Cloud**: Crear un proyecto (ej: `crystaltides-prod`).
2.  **Google Cloud SDK**: Instalar `gcloud` CLI en tu máquina local.
3.  **Docker**: Para construir las imágenes localmente antes de subir (o usar Cloud Build).

## 🚀 Paso a Paso

### 1. Habilitar Servicios

En tu consola de GCP, habilita las siguientes APIs:

- **Cloud Run API**
- **Artifact Registry API** (Para guardar las imágenes Docker)
- **Cloud Build API** (Opcional, si usmos CI/CD)

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

### 2. Crear Repositorio de Artefactos

Lugar donde se guardarán tus imágenes de Docker (`crystaltides-repo`).

```bash
gcloud artifacts repositories create crystaltides-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Repositorio Docker para CrystalTides"
```

### 3. Configurar Secretos (Variables de Entorno)

Para producción, NO uses el archivo `.env`. Usa **Secret Manager** o variables de entorno directas en Cloud Run.

Requerirás configurar:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Build args para Frontend)
- `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` (MySQL)
- `SUPABASE_URL`, `SERVICE_ROLE_KEY`

### 4. Despliegue Manual (Primera Vez)

#### A. Backend

```bash
# 1. Build & Push
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/crystaltides-repo/backend ./apps/web-server

# 2. Deploy
gcloud run deploy crystaltides-backend \
    --image us-central1-docker.pkg.dev/PROJECT_ID/crystaltides-repo/backend \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3001 \
    --set-env-vars="NODE_ENV=production,DB_HOST=...,DISCORD_WEBHOOK_URL=..."
```

#### B. Frontend

El frontend requiere las variables de entorno **durante el build** (Vite).

```bash
# 1. Build & Push (Pasando build-args)
gcloud builds submit \
    --tag us-central1-docker.pkg.dev/PROJECT_ID/crystaltides-repo/frontend \
    --substitutions=_VITE_SUPABASE_URL="...",_VITE_SUPABASE_ANON_KEY="..." \
    ./apps/web-client

# 2. Deploy
gcloud run deploy crystaltides-web \
    --image us-central1-docker.pkg.dev/PROJECT_ID/crystaltides-repo/frontend \
    --region us-central1 \
    --allow-unauthenticated \
    --port 80
```

#### C. Discord Bot

El bot necesita estar siempre activo, no puede "dormirse" (escalar a cero).

```bash
# Deploy con min-instances 1
gcloud run deploy crystaltides-bot \
    --image us-central1-docker.pkg.dev/PROJECT_ID/crystaltides-repo/bot \
    --region us-central1 \
    --no-cpu-throttling \
    --min-instances 1 \
    --max-instances 1
```

---

## 🔄 CI/CD Automatizado (GitHub Actions)

Recomiendo crear un archivo `.github/workflows/deploy.yml` para que cada vez que hagas `git push main`, se despliegue automáticamente.

1.  Crear **Service Account** en GCP con permisos de `Cloud Run Admin` y `Service Account User`.
2.  Exportar la clave JSON y guardarla en GitHub Secrets (`GCP_SA_KEY`).
3.  El workflow usará `google-github-actions/deploy-cloudrun`.

## 💰 Estimación de Costos

- **Cloud Run (Frontend/Backend)**: Probablemente **Gratis** (Free Tier: 2M invocaciones/mes).
- **Cloud Run (Bot)**: Al tener `min-instances: 1`, costará aprox **$6 - $15 USD/mes** (dependiendo de la CPU/RAM asignada, e.g. 0.5 CPU, 256MB RAM).
- **Artifact Registry**: Centavos (almacenamiento GB).

---

> **Recomendación Personal**: Si quieres ahorrar los $10/mes del bot en la nube, mantén el bot corriendo en tu VPS actual o donde tengas el servidor de Minecraft, y usa Cloud Run solo para la Web y el Backend (gratis/barato).
