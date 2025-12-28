# ☁️ Guía de Despliegue en Google Cloud Platform (GCP)

Este plan detalla cómo llevar **CrystalTides** a producción utilizando una arquitectura **Serverless** y **Contenerizada** en Google Cloud.

## 🏗️ Arquitectura Propuesta

Utilizaremos **Google Cloud Run** para todos los servicios. Es una solución "Serverless" que ejecuta contenedores Docker, escala automáticamente y cobra solo por uso (o por instancia activa).

| Servicio          | Tecnología            | Estrategia GCP     | Notas                                                                      |
| :---------------- | :-------------------- | :----------------- | :------------------------------------------------------------------------- |
| **Frontend**      | React + Vite + Nginx  | **Cloud Run**      | Servir estáticos con Nginx en contenedor.                                  |
| **Backend**       | Express (Node.js)     | **Cloud Run**      | API REST pública. Escala a cero si no hay uso.                             |
| **Discord Bot**   | Bun / Discord.js      | **Cloud Run**      | **Importante**: Configurar "min-instances: 1" para mantenerlo online 24/7. |
| **Minecraft**     | Paper / Purpur (Java) | **Compute Engine** | VM Dedicada (`e2-standard-4`) con Disco Persistente. NO Cloud Run.         |
| **Base de Datos** | MySQL / Postgres      | **Externa/VM**     | Supabase (Web) + Docker MySQL en VM (Juego).                               |

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

---

## 🎮 Futuro: Migración del Servidor de Minecraft

Para mover el servidor de Minecraft a GCP y aprovechar los créditos, **NO podemos usar Cloud Run**, ya que Minecraft requiere persistencia de datos (el mundo) y conexión TCP/UDP directa y constante.

### Estrategia: Google Compute Engine (GCE)

Debemos crear una **Máquina Virtual (VM)** dedicada.

#### 1. Configuración Recomendada (Gama Alta)

- **Tipo de Máquina**: `e2-standard-4` (4 vCPU, 16GB RAM) o `n2-standard-4` (Rendimiento superior).
- **Disco**: **SSD Persistente** (mínimo 50GB) para carga rápida de chunks.
- **Sistema Operativo**: Ubuntu 22.04 LTS (o la distro Linux que prefieras).

#### 2. Pasos de Migración

1.  **Crear VM**: En Compute Engine > Instancias de VM.
2.  **IP Estática**: Reservar una dirección IP externa estática para que no cambie al reiniciar.
3.  **Firewall (Seguridad)**:
    - **Puerto**: Se recomienda **NO usar el 25565** (default) para evitar scanners automáticos. Usa un puerto alto no estándar (ej: `25577`).
    - **Proxy (Recomendado)**: Si usas Velocity o BungeeCord, configura el Firewall de GCP para que **SOLO acepte conexiones desde la IP de tu Proxy** (o servicios como TCPShield). Esto oculta la IP real de tu VM.
4.  **Transferencia (Cloud-to-Cloud)**:
    - **Pro Tip**: Si tienes poco ancho de banda local, **NO descargues el servidor a tu PC**.
    - Conéctate por SSH a la VM de Google.
    - Usa `sftp` o `rclone` desde la consola de la VM para descargar los archivos **directamente desde HolyHosting**.
    - La red de Google bajará los 40GB en segundos/minutos sin tocar tu internet de casa.
5.  **Java**: Instalar Java 21/22 (según requiera tu versión de Paper/Purpur).

#### 3. Optimización de Costos (Créditos)

Google Cloud es caro para cómputo 24/7.

- **Spot Instances (Preemptible)**: Son 60-90% más baratas, pero Google puede apagarlas en cualquier momento. _No recomendado para servidores públicos serios_, pero genial para pruebas.
- **Committed Use Discounts**: Si te quedas 1 o 3 años, obtienes gran descuento.
- **Apagado Automático**: Si es un servidor privado, programa scripts para apagar la VM cuando no haya jugadores (ahorra muchísimo).

> **Nota**: Al estar en la misma red de Google que tu API (Cloud Run), la latencia entre el Plugin (CrystalCore) y la Web será prácticamente **cero**.

---

### 💾 Estrategia de Base de Datos (Minecraft + Web)

**¿1 o 2 Bases de Datos?**
Necesitaremos **2 Motores Distintos**, pero no necesariamente 2 facturas.

1.  **Web (PostgreSQL)**: CrystalTides Web usa Supabase (Postgres). Es excelente y tiene capa gratuita. **Recomendación: MANTENER SUPABASE**.
2.  **Minecraft (MySQL)**: Plugins como `CoreProtect` (Logs) o `LuckPerms` (Permisos) funcionan nativamente mejor con **MySQL/MariaDB**. PostgreSQL suele dar problemas de compatibilidad en el ecosistema de Minecraft (Plugins legacy).

#### 💡 Solución "Todo en Uno" (Credits Friendly)

Ya que vas a tener una VM para Minecraft (`Minecraft Server VM`), la mejor estrategia es:

- **Instalar Docker en la VM de Minecraft**.
- Levantar un **contenedor de MySQL** dentro de esa misma VM (Localhost).
  - _Costo Extra_: $0 (Usa el mismo disco/CPU de la VM).
  - _Latencia_: 0ms (Ultrarápido para plugins).
- **Web**: Sigue conectándose a Supabase externamente.

De esta forma, **no pagas** una instancia gestionada de Cloud SQL (que es muy cara, ~$30/mes mínimo), y aprovechas los créditos del Compute Engine para todo.

---

### ❓ FAQ: ¿Deberíamos usar Kubernetes (GKE)?

**Respuesta Corta: NO.**

**¿Por qué?**
Kubernetes (K8s) sirve para orquestar cientos de microservicios. Para CrystalTides, usar un Cluster de K8s sería como **"matar moscas a cañonazos"**:

1.  **Costo Base**: Un cluster GKE cobra una tarifa de gestión (~$70/mes) + los nodos. Cloud Run es gratis si no se usa.
2.  **Complejidad**: Mantener un cluster requiere conocimientos avanzados de DevOps.
3.  **Cloud Run YA ES Kubernetes**: Por debajo, Cloud Run usa Knative (Kubernetes) gestionado por Google. Obtienes los beneficios (contenedores, escalado) sin el dolor de cabeza de administrar el cluster.

**Cuándo sí usar K8s**: Si tuviéramos 50 servidores de Minecraft distintos y quisiéramos crear/destruir instancias dinámicamente según la demanda en tiempo real (Lobby System masivo). Para 1 solo servidor SMP, una VM es superior.
