# =========================================================================
# 🏗️ Terraform Google Cloud Platform (GCP) Specification for CrystalTides
# Cloud Run & Artifact Registry Disaster Recovery & Automation
# =========================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── 1. Habilitación de APIs de Google Cloud ──
resource "google_project_service" "enabled_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com"
  ])

  service            = each.key
  disable_on_destroy = false
}

# ── 2. Repositorio Docker en Artifact Registry ──
resource "google_artifact_registry_repository" "crystaltides_repo" {
  depends_on    = [google_project_service.enabled_apis]
  location      = var.region
  repository_id = var.artifact_repo_name
  description   = "Docker container registry for CrystalTides web and server images"
  format        = "DOCKER"
}

# ── 3. Servicio Cloud Run: Backend (API / Web Server) ──
resource "google_cloud_run_v2_service" "backend" {
  depends_on = [google_project_service.enabled_apis, google_artifact_registry_repository.crystaltides_repo]
  name       = var.backend_service_name
  location   = var.region
  ingress    = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_repo_name}/backend:latest"
      
      ports {
        container_port = var.backend_port
      }

      resources {
        limits = {
          cpu    = var.backend_cpu
          memory = var.backend_memory
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = tostring(var.backend_port)
      }
    }
  }

  lifecycle {
    # Ignorar cambios de tag de imagen (gestionados por GitHub Actions en cada push)
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version
    ]
  }
}

# ── 4. Servicio Cloud Run: Frontend (Web Client) ──
resource "google_cloud_run_v2_service" "frontend" {
  depends_on = [google_project_service.enabled_apis, google_artifact_registry_repository.crystaltides_repo]
  name       = var.frontend_service_name
  location   = var.region
  ingress    = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_repo_name}/frontend:latest"

      ports {
        container_port = var.frontend_port
      }

      resources {
        limits = {
          cpu    = var.frontend_cpu
          memory = var.frontend_memory
        }
      }

      env {
        name  = "PORT"
        value = tostring(var.frontend_port)
      }
    }
  }

  lifecycle {
    # Ignorar cambios de tag de imagen (gestionados por GitHub Actions en cada push)
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version
    ]
  }
}

# ── 5. Permisos de Invocación Pública (allUsers) ──
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  count    = var.enable_public_access ? 1 : 0
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  count    = var.enable_public_access ? 1 : 0
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ── 6. Service Account para CI/CD de GitHub Actions ──
resource "google_service_account" "github_deployer" {
  count        = var.create_github_deployer_sa ? 1 : 0
  account_id   = var.github_deployer_sa_name
  display_name = "GitHub Actions CI/CD Deployer"
  description  = "Service account used by GitHub Actions deploy.yml to push images and update Cloud Run"
}

# Roles asignados al deployer
resource "google_project_iam_member" "deployer_run_admin" {
  count   = var.create_github_deployer_sa ? 1 : 0
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.github_deployer[0].email}"
}

resource "google_project_iam_member" "deployer_artifact_writer" {
  count   = var.create_github_deployer_sa ? 1 : 0
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_deployer[0].email}"
}

resource "google_project_iam_member" "deployer_sa_user" {
  count   = var.create_github_deployer_sa ? 1 : 0
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.github_deployer[0].email}"
}
