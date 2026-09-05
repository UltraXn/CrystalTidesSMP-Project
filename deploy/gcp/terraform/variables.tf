# =========================================================================
# ⚙️ Terraform Variables for CrystalTides Google Cloud Platform (GCP)
# Disaster Recovery & Automated Cloud Run / Artifact Registry Provisioning
# =========================================================================

variable "project_id" {
  description = "ID del proyecto en Google Cloud Platform"
  type        = string
  default     = "crystaltides-prod"
}

variable "region" {
  description = "Región principal de GCP (coincide con .github/workflows/deploy.yml)"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Entorno (production / staging)"
  type        = string
  default     = "production"
}

# ── Artifact Registry ──

variable "artifact_repo_name" {
  description = "Nombre del repositorio Docker en Artifact Registry"
  type        = string
  default     = "crystaltides-repo"
}

# ── Cloud Run Services ──

variable "backend_service_name" {
  description = "Nombre del servicio Cloud Run para la API / Web Server"
  type        = string
  default     = "crystaltides-backend"
}

variable "backend_port" {
  description = "Puerto en el que escucha el backend en su contenedor"
  type        = number
  default     = 3001
}

variable "backend_cpu" {
  description = "Límite de CPU para el backend"
  type        = string
  default     = "1"
}

variable "backend_memory" {
  description = "Límite de RAM para el backend"
  type        = string
  default     = "1Gi"
}

variable "frontend_service_name" {
  description = "Nombre del servicio Cloud Run para el Frontend Web Client"
  type        = string
  default     = "crystaltides-web"
}

variable "frontend_port" {
  description = "Puerto en el que escucha el frontend Nginx unprivileged"
  type        = number
  default     = 8080
}

variable "frontend_cpu" {
  description = "Límite de CPU para el frontend"
  type        = string
  default     = "1"
}

variable "frontend_memory" {
  description = "Límite de RAM para el frontend"
  type        = string
  default     = "512Mi"
}

variable "enable_public_access" {
  description = "Si es true, permite acceso público (allUsers) a Cloud Run"
  type        = bool
  default     = true
}

# ── GitHub Actions CI/CD Integration ──

variable "create_github_deployer_sa" {
  description = "Si es true, crea la Service Account con roles necesarios para GitHub Actions"
  type        = bool
  default     = true
}

variable "github_deployer_sa_name" {
  description = "Nombre de la Service Account para GitHub Actions"
  type        = string
  default     = "github-actions-deployer"
}
