# 🚀 Guía de Despliegue en Oracle Cloud (OCI Free Tier)

Esta guía explica detalladamente cómo desplegar el plano de control (Pelican Panel, FRP Server y Bot de Discord) en tu instancia gratuita de Oracle Cloud, y cómo reconectar tu laptop y celular Termux.

---

## 🛠️ Paso 1: Configurar la VM y Red en Oracle Cloud Console

Al crear tu instancia VM en OCI (usando Ubuntu 24.04 LTS):

### 1. Permitir puertos en las "Security Lists" (Consola OCI)
Ve a **Networking -> Virtual Cloud Networks -> Tu VCN -> Security Lists -> Default Security List**:
Añade **Ingress Rules** (Reglas de entrada) con los siguientes datos (Stateless: No, Source CIDR: `0.0.0.0/0`):
*   **IP Protocol:** `TCP`, **Source Port Range:** `All`, **Destination Port:** `80,443` (Pelican Web Panel & SSL).
*   **IP Protocol:** `TCP`, **Source Port Range:** `All`, **Destination Port:** `7000` (FRP Server Control).
*   **IP Protocol:** `TCP`, **Source Port Range:** `All`, **Destination Port:** `8023` (Local Spy Proxy).
*   **IP Protocol:** `TCP`, **Source Port Range:** `All`, **Destination Port:** `8082` (Wings Daemon Proxy).
*   **IP Protocol:** `TCP/UDP`, **Source Port Range:** `All`, **Destination Port:** `25565` (Minecraft Server).

---

## 🖥️ Paso 2: Configurar el Firewall Interno en la VM (iptables de Oracle)

Las imágenes de Ubuntu en Oracle Cloud vienen por defecto con reglas de firewall muy estrictas que bloquean los puertos incluso si los abres en la consola. Ejecuta estos comandos dentro de la VM por SSH para abrirlos:

```bash
# Instalar iptables-persistent para guardar reglas
sudo apt update && sudo apt install iptables-persistent -y

# Abrir puertos necesarios en el firewall local de la VM
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 7000 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 8023 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 8082 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 25565 -j ACCEPT
sudo iptables -I INPUT 6 -p udp --dport 25565 -j ACCEPT

# Guardar las reglas para que no se borren al reiniciar
sudo netfilter-persistent save
```

---

## 📦 Paso 3: Desplegar el Stack con Docker

1. Instala Docker y Docker Compose en la VM de OCI:
   ```bash
   sudo apt install docker.io docker-compose-v2 -y
   sudo usermod -aG docker $USER
   # Cierra sesión SSH y vuelve a entrar para aplicar los permisos de Docker
   ```
2. Crea una carpeta en la VM llamada `oracle-cloud` y sube los archivos `compose.yml`, `Caddyfile`, y `frps.toml`.
3. Edita la variable `APP_URL` en el `compose.yml` para apuntar a tu dominio (ej: `https://panel.crystaltidessmp.net`) o a tu IP pública (`http://<IP_DE_ORACLE>`).
4. Levanta el stack:
   ```bash
   docker compose up -d
   ```
5. Crea tu cuenta de Administrador en el panel:
   ```bash
   docker compose exec panel php artisan p:user:make
   # Sigue las preguntas interactivas en pantalla (Admin = Yes)
   ```

---

## 🔌 Paso 4: Conectar los Clientes FRP locales

### A. En la Laptop de Desarrollo (`192.168.100.52`)
1. Sube el archivo `frpc.toml.laptop` a tu laptop de desarrollo, cámbiale el nombre a `frpc.toml` y ponle tu IP pública de Oracle en `serverAddr`.
2. Inicia el cliente FRP en la laptop:
   ```bash
   frpc -c frpc.toml
   ```

### B. En el Celular LG (`192.168.100.120`)
1. Sube el archivo `frpc.toml.phone` a tu celular (dentro de `~/local-spy/frpc.toml` en Termux) y actualiza la IP de Oracle en `serverAddr`.
2. Reinicia los servicios de espía local en el celular ejecutando:
   ```bash
   bash ~/local-spy/start_spy.sh
   ```

---

## 🤖 Paso 5: Actualizar el Bot de Discord

En la máquina donde corre tu bot de Discord, actualiza las variables en el `.env`:
```env
TARGET_MAC_ADDRESS=a0:48:1c:dd:38:91
LOCAL_SPY_URL=http://<TU_IP_DE_ORACLE>:8023/wake
```
Reinicia el bot de Discord y listo! El botón `⚡ Encender PC (WOL)` enviará la petición a tu instancia de Oracle Cloud, esta la mandará al celular a través del túnel de FRP, y el celular despertará la laptop mediante la red local.
