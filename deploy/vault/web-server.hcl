# Policy for the web-server token (Cloud Run or any other host).
# Read-only access to its own KV v2 secret and nothing else: a leaked token
# cannot write secrets, read other paths or create tokens.
# Renewing and looking up its own token come from Vault's built-in "default" policy.
#
#   vault policy write crystaltides-web-server deploy/vault/web-server.hcl

path "secret/data/crystaltides" {
  capabilities = ["read"]
}
