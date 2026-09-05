# =========================================================================
# ⚙️ Terraform Variables for CrystalTides OCI Infrastructure
# =========================================================================

variable "tenancy_ocid" {
  description = "OCID del Tenancy de Oracle Cloud"
  type        = string
  default     = ""
}

variable "user_ocid" {
  description = "OCID del usuario de OCI para autenticación API"
  type        = string
  default     = ""
}

variable "fingerprint" {
  description = "Fingerprint de la clave API de OCI"
  type        = string
  default     = ""
}

variable "private_key_path" {
  description = "Ruta local a la clave privada .pem de la API de OCI"
  type        = string
  default     = ""
}

variable "compartment_id" {
  description = "OCID del Compartment donde se crearán los recursos"
  type        = string
}

variable "region" {
  description = "Región de Oracle Cloud (ej: sa-santiago-1, sa-saopaulo-1, us-ashburn-1, us-phoenix-1)"
  type        = string
  default     = "sa-santiago-1"
}

variable "environment" {
  description = "Nombre del entorno (producción / staging)"
  type        = string
  default     = "production"
}

# ── Compute / Máquina Virtual ──

variable "instance_name" {
  description = "Nombre descriptivo de la instancia Compute"
  type        = string
  default     = "crystaltides-core-vm"
}

variable "instance_shape" {
  description = "Shape de la máquina (A1.Flex es el ARM Always Free de OCI)"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "instance_ocpus" {
  description = "Número de OCPUs (OCI Free Tier permite hasta 4 OCPUs ARM Ampere)"
  type        = number
  default     = 4
}

variable "instance_memory_in_gbs" {
  description = "Cantidad de RAM en GB (OCI Free Tier permite hasta 24 GB)"
  type        = number
  default     = 24
}

variable "boot_volume_size_in_gbs" {
  description = "Tamaño del disco de arranque en GB (OCI Free Tier permite hasta 200 GB en total)"
  type        = number
  default     = 100
}

variable "ssh_public_key" {
  description = "Contenido de tu clave pública SSH (~/.ssh/id_rsa.pub o id_ed25519.pub)"
  type        = string
}

# ── Red / Networking ──

variable "vcn_cidr" {
  description = "Rango CIDR de la Virtual Cloud Network"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "Rango CIDR de la subred pública"
  type        = string
  default     = "10.0.1.0/24"
}

variable "assign_reserved_public_ip" {
  description = "Si es true, reserva una IP pública estática que nunca cambia entre reinicios"
  type        = bool
  default     = true
}

# ── Cloudflare DNS Automation (Opcional) ──

variable "enable_cloudflare" {
  description = "Si es true, crea automáticamente los registros DNS en Cloudflare apuntando a la IP pública"
  type        = bool
  default     = false
}

variable "cloudflare_api_token" {
  description = "API Token de Cloudflare con permisos de edición de DNS"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Zone ID de tu dominio en Cloudflare"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Dominio principal (ej: crystaltidessmp.net)"
  type        = string
  default     = "crystaltidessmp.net"
}
