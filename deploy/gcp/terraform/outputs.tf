# =========================================================================
# 📤 Terraform Outputs for CrystalTides Google Cloud Platform (GCP)
# =========================================================================

output "backend_url" {
  description = "URL asignada por Cloud Run para el Backend (API)"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "URL asignada por Cloud Run para el Frontend (Web Client)"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "artifact_registry_repo" {
  description = "Ruta completa del repositorio en Artifact Registry"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_repo_name}"
}

output "github_deployer_sa_email" {
  description = "Email de la Service Account creada para GitHub Actions (si create_github_deployer_sa=true)"
  value       = var.create_github_deployer_sa ? google_service_account.github_deployer[0].email : null
}
