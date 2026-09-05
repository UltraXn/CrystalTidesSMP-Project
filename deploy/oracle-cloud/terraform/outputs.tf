# =========================================================================
# 📤 Terraform Outputs for CrystalTides OCI Infrastructure
# =========================================================================

output "instance_public_ip" {
  description = "IP Pública oficial del servidor en Oracle Cloud (Estática si assign_reserved_public_ip=true)"
  value       = local.server_public_ip
}

output "instance_private_ip" {
  description = "IP Privada dentro de la VCN de Oracle"
  value       = oci_core_instance.crystaltides_vm.private_ip
}

output "ssh_connection_command" {
  description = "Comando rápido para conectarte por SSH a la máquina"
  value       = "ssh ubuntu@${local.server_public_ip}"
}

output "pelican_panel_url" {
  description = "URL para acceder a Pelican Panel"
  value       = "https://${var.domain_name}"
}

output "minecraft_server_address" {
  description = "Dirección para conectar clientes de Minecraft"
  value       = "${local.server_public_ip}:25565"
}

output "vcn_id" {
  description = "OCID de la VCN creada"
  value       = oci_core_vcn.crystaltides_vcn.id
}
