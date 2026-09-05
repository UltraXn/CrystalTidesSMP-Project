# 🚀 Aprovisionamiento Automatizado con Terraform (OCI + Docker)

Este módulo automatiza la creación completa de la infraestructura de **CrystalTides** en **Oracle Cloud Infrastructure (OCI)** dentro del plan **Always Free (ARM Ampere A1)** y conecta el stack con Docker y Cloudflare.

---

## 🏗️ Lo que crea Terraform automáticamente:

1. **Red Virtual (VCN)**: Subred pública, Internet Gateway y tablas de ruteo (`10.0.0.0/16`).
2. **Firewall Cloud (Security List)**:
   - **80 / 443 TCP**: Web y SSL (Caddy Reverse Proxy & Pelican Panel).
   - **25565 TCP/UDP**: Tráfico de jugadores de Minecraft.
   - **2022 TCP**: SFTP de Pelican Wings para administración de archivos.
   - **7000 TCP**: Túnel de control de FRP Server.
   - **8022 / 8023 TCP**: Túneles SSH y Wake-on-LAN (Local Spy).
   - **22 TCP**: Administración remota SSH.
3. **Máquina Virtual (Compute Instance)**:
   - Shape: `VM.Standard.A1.Flex` (ARM64 Ampere de 4 OCPUs y 24 GB de RAM).
   - Sistema Operativo: Ubuntu 24.04 LTS.
   - Disco de Arranque: 100 GB.
   - IP Pública Reservada (Estática fija).
4. **Bootstrap Automático (`cloud-init.yaml`)**:
   - En el primer arranque, la máquina configura `iptables` persistente, instala Docker y Docker Compose, configura un swapfile de 4 GB y prepara las carpetas.
5. **DNS en Cloudflare (Opcional)**:
   - Apunta `panel.crystaltidessmp.net` y `mc.crystaltidessmp.net` directamente a la nueva IP.

---

## 🛠️ Guía Rápida de Despliegue

### 1. Prerrequisitos
Tener instalado [Terraform](https://developer.hashicorp.com/terraform/install) en tu máquina local.

### 2. Configurar Variables
Copia la plantilla de variables:
```bash
cd deploy/oracle-cloud/terraform
cp terraform.tfvars.example terraform.tfvars
```
Abre `terraform.tfvars` con tu editor y coloca tus OCIDs de Oracle Cloud y tu clave SSH pública:
- `tenancy_ocid`, `user_ocid`, `fingerprint`, `private_key_path`.
- `compartment_id` y `region`.
- `ssh_public_key` (ej: contenido de `~/.ssh/id_ed25519.pub`).

### 3. Inicializar y Desplegar
```bash
# Inicializar los proveedores de Terraform
terraform init

# Ver los recursos que se van a crear
terraform plan

# Aplicar y crear toda la infraestructura en OCI (tarda ~90 segundos)
terraform apply
```

### 4. Conectarte y Levantar el Stack
Al finalizar, Terraform mostrará en pantalla la IP Pública asignada y el comando de conexión:
```bash
ssh ubuntu@<IP_PUBLICA>

# Subir tu carpeta deploy/oracle-cloud y levantar:
cd crystaltides/deploy/oracle-cloud
docker compose up -d
```
