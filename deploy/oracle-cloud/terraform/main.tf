# =========================================================================
# 🏗️ Terraform Main Infrastructure Specification for CrystalTides
# Cloud: Oracle Cloud Infrastructure (OCI Always Free Tier ARM64)
# =========================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# ── Proveedor OCI ──
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid != "" ? var.tenancy_ocid : null
  user_ocid        = var.user_ocid != "" ? var.user_ocid : null
  fingerprint      = var.fingerprint != "" ? var.fingerprint : null
  private_key_path = var.private_key_path != "" ? var.private_key_path : null
  region           = var.region
}

# ── Proveedor Cloudflare (Opcional) ──
provider "cloudflare" {
  api_token = var.enable_cloudflare ? var.cloudflare_api_token : null
}

# ── Disponibilidad de Dominios e Imágenes ──
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.compartment_id
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = var.instance_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# ── 1. Virtual Cloud Network (VCN) ──
resource "oci_core_vcn" "crystaltides_vcn" {
  compartment_id = var.compartment_id
  cidr_block     = var.vcn_cidr
  display_name   = "crystaltides-vcn-${var.environment}"
  dns_label      = "crystaltides"
}

# ── 2. Internet Gateway ──
resource "oci_core_internet_gateway" "crystaltides_ig" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.crystaltides_vcn.id
  display_name   = "crystaltides-ig-${var.environment}"
  enabled        = true
}

# ── 3. Route Table ──
resource "oci_core_route_table" "crystaltides_rt" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.crystaltides_vcn.id
  display_name   = "crystaltides-rt-${var.environment}"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.crystaltides_ig.id
  }
}

# ── 4. Security List (Firewall Cloud de Entrada/Salida) ──
resource "oci_core_security_list" "crystaltides_sl" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.crystaltides_vcn.id
  display_name   = "crystaltides-security-list-${var.environment}"

  # Regla de salida universal (permite actualizaciones, descargas y docker pull)
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    description = "Allow all outbound internet traffic"
  }

  # 1. SSH (Puerto 22)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    description = "SSH Remote Administration"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # 2. Web HTTP / HTTPS (Puertos 80, 443 - Caddy & Pelican Panel)
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "HTTP Web Traffic"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "HTTPS Web SSL Traffic"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # 3. FRP Server Control (Puerto 7000)
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "FRP Control Tunnel Port"
    tcp_options {
      min = 7000
      max = 7000
    }
  }

  # 4. Local Spy Proxy (Puerto 8023)
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Local Spy Proxy for Wake-On-LAN"
    tcp_options {
      min = 8023
      max = 8023
    }
  }

  # 5. Laptop SSH Tunnel (Puerto 8022)
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Laptop Development SSH Proxy"
    tcp_options {
      min = 8022
      max = 8022
    }
  }

  # 6. Wings SFTP Proxy (Puerto 2022)
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Wings SFTP File Management"
    tcp_options {
      min = 2022
      max = 2022
    }
  }

  # 7. Minecraft Server (Puerto 25565 TCP y UDP)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    description = "Minecraft TCP Game Traffic"
    tcp_options {
      min = 25565
      max = 25565
    }
  }

  ingress_security_rules {
    protocol    = "17" # UDP
    source      = "0.0.0.0/0"
    description = "Minecraft Bedrock / Query UDP Traffic"
    udp_options {
      min = 25565
      max = 25565
    }
  }

  # 8. ICMP (Ping & Path MTU Discovery)
  ingress_security_rules {
    protocol    = "1" # ICMP
    source      = "0.0.0.0/0"
    description = "ICMP Ping & MTU negotiation"
    icmp_options {
      type = 3
      code = 4
    }
  }

  ingress_security_rules {
    protocol    = "1"
    source      = "0.0.0.0/0"
    description = "ICMP Echo Request"
    icmp_options {
      type = 8
      code = 0
    }
  }
}

# ── 5. Subred Pública ──
resource "oci_core_subnet" "crystaltides_subnet" {
  compartment_id      = var.compartment_id
  vcn_id              = oci_core_vcn.crystaltides_vcn.id
  cidr_block          = var.subnet_cidr
  display_name        = "crystaltides-subnet-${var.environment}"
  dns_label           = "public"
  route_table_id      = oci_core_route_table.crystaltides_rt.id
  security_list_ids   = [oci_core_security_list.crystaltides_sl.id]
  dhcp_options_id     = oci_core_vcn.crystaltides_vcn.default_dhcp_options_id
}

# ── 6. Máquina Virtual Compute (ARM Ampere Always Free) ──
resource "oci_core_instance" "crystaltides_vm" {
  compartment_id      = var.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = var.instance_name
  shape               = var.instance_shape

  # Configuración elástica de OCPU y RAM (Ampere A1)
  dynamic "shape_config" {
    for_each = length(regexall(".*Flex", var.instance_shape)) > 0 ? [1] : []
    content {
      ocpus         = var.instance_ocpus
      memory_in_gbs = var.instance_memory_in_gbs
    }
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.crystaltides_subnet.id
    display_name     = "crystaltides-vnic"
    assign_public_ip = true
    hostname_label   = "core"
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(file("${path.module}/cloud-init.yaml"))
  }

  preserve_boot_volume = false
}

# ── 7. IP Pública Reservada (Estática) ──
data "oci_core_vnic_attachments" "vm_vnics" {
  compartment_id = var.compartment_id
  instance_id    = oci_core_instance.crystaltides_vm.id
}

data "oci_core_vnic" "primary_vnic" {
  vnic_id = data.oci_core_vnic_attachments.vm_vnics.vnic_attachments[0].vnic_id
}

data "oci_core_private_ips" "primary_private_ips" {
  vnic_id = data.oci_core_vnic.primary_vnic.id
}

resource "oci_core_public_ip" "crystaltides_reserved_ip" {
  count          = var.assign_reserved_public_ip ? 1 : 0
  compartment_id = var.compartment_id
  lifetime       = "RESERVED"
  display_name   = "crystaltides-reserved-ip-${var.environment}"
  private_ip_id  = data.oci_core_private_ips.primary_private_ips.private_ips[0].id
}

# ── 8. Registros DNS Cloudflare Automáticos (Opcional) ──
locals {
  server_public_ip = var.assign_reserved_public_ip ? oci_core_public_ip.crystaltides_reserved_ip[0].ip_address : oci_core_instance.crystaltides_vm.public_ip
}

resource "cloudflare_record" "panel_dns" {
  count   = var.enable_cloudflare ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "panel"
  content = local.server_public_ip
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "minecraft_dns" {
  count   = var.enable_cloudflare ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "mc"
  content = local.server_public_ip
  type    = "A"
  proxied = false # El tráfico de Minecraft no puede pasar por el proxy HTTP de Cloudflare
  ttl     = 300
}
