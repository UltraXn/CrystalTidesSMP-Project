# ☁️ Aprovisionamiento Automatizado de Google Cloud con Terraform

Este módulo de Terraform define y provisiona toda la infraestructura en **Google Cloud Platform (GCP)** que necesita el pipeline de CI/CD de [`.github/workflows/deploy.yml`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/.github/workflows/deploy.yml).

---

## 🏗️ Recursos Gestionados en GCP

1. **APIs Habilitadas**:
   - Cloud Run (`run.googleapis.com`)
   - Artifact Registry (`artifactregistry.googleapis.com`)
   - Identity & Access Management (`iam.googleapis.com`)
2. **Artifact Registry**:
   - Repositorio Docker: `us-central1-docker.pkg.dev/crystaltides-prod/crystaltides-repo`
3. **Servicios Cloud Run**:
   - **`crystaltides-backend`**: 1 CPU, 1 GB RAM, puerto 3001, invocación pública (`allUsers`).
   - **`crystaltides-web`**: 1 CPU, 512 MB RAM, puerto 8080, invocación pública (`allUsers`).
   - Ciclo de vida con `ignore_changes` en las imágenes para que GitHub Actions gestione los deploys de código sin interferencia de Terraform.
4. **Service Account para GitHub Actions**:
   - Crea la cuenta `github-actions-deployer` con roles:
     - `roles/run.admin` (para actualizar Cloud Run).
     - `roles/artifactregistry.writer` (para pushear imágenes Docker).
     - `roles/iam.serviceAccountUser` (para ejecutar como la cuenta del servicio).

---

## 🛠️ Guía Rápida de Despliegue / Disaster Recovery

### 1. Autenticarse en GCP
```bash
gcloud auth application-default login
gcloud config set project crystaltides-prod
```

### 2. Configurar Variables
```bash
cd deploy/gcp/terraform
cp terraform.tfvars.example terraform.tfvars
```

### 3. Aplicar Terraform
```bash
terraform init
terraform plan
terraform apply
```

Al terminar, la infraestructura estará 100% levantada y lista para recibir los despliegues de GitHub Actions.
