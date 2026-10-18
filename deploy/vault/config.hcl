# =========================================================================
# 🔑 HashiCorp Vault Production Configuration
# Standards: CIS HashiCorp Vault Benchmark & CrystalTides Infrastructure
# =========================================================================

# Enable Vault Web UI
ui = true

# Memory locking prevents sensitive cryptographic keys from being swapped to disk.
# Container must have 'IPC_LOCK' capability (cap_add: IPC_LOCK in compose.yml).
disable_mlock = false

# Persistent storage backend using local volume mounted at /vault/file
storage "file" {
  path = "/vault/file"
}

# TCP Listener: TLS is disabled on this local listener because TLS termination
# is handled by the upstream Caddy edge reverse proxy.
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

# Cluster and API advertising address for internal container communication
api_addr = "http://127.0.0.1:8200"
