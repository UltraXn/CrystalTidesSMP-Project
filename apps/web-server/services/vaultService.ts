import vault from 'node-vault';

type VaultClient = ReturnType<typeof vault>;

/**
 * The server runs with a periodic token (docs/operations/web-server-secrets.md):
 * it expires unless renewed, so every successful start extends it. A failed
 * renewal must not block the start-up: the token is still valid right now.
 */
async function renewToken(client: VaultClient): Promise<void> {
  try {
    await client.tokenRenewSelf();
  } catch (error) {
    console.warn(
      `⚠️ [Vault] Token renewal failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * Initializes the HashiCorp Vault client and loads secrets into process.env.
 * If VAULT_ADDR or VAULT_TOKEN are not set, it falls back to local environment variables.
 */
export async function initVault(): Promise<boolean> {
  const vaultAddr = process.env.VAULT_ADDR;
  const vaultToken = process.env.VAULT_TOKEN;
  const secretPath = process.env.VAULT_SECRET_PATH ?? 'secret/data/crystaltides';

  if (!vaultAddr || !vaultToken) {
    console.log('🔑 [Vault] VAULT_ADDR or VAULT_TOKEN not set. Using local .env fallback.');
    return true; // Treat as success since we fall back to local .env
  }

  console.log(`🔑 [Vault] Connecting to Vault at ${vaultAddr}...`);

  try {
    const client = vault({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
    });

    // Check if Vault is sealed
    const status = await client.health();
    if (status.sealed) {
      console.error('❌ [Vault] Vault server is sealed. Cannot fetch secrets.');
      return false;
    }

    console.log(`🔑 [Vault] Fetching secrets from path: ${secretPath}`);
    const response = await client.read(secretPath);

    // KV v2 engine stores data under response.data.data
    // KV v1 engine stores data under response.data
    let secrets: Record<string, string> | undefined;

    if (response?.data) {
      if (response.data.data) {
        secrets = response.data.data; // KV v2
      } else {
        secrets = response.data; // KV v1 fallback
      }
    }

    if (!secrets || Object.keys(secrets).length === 0) {
      console.error(`❌ [Vault] No secrets found at path ${secretPath}`);
      return false;
    }

    // Inject secrets into process.env
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value;
    }

    console.log(`✅ [Vault] Loaded ${Object.keys(secrets).length} secrets into environment.`);
    await renewToken(client);
    return true;
  } catch (error) {
    console.error(
      `❌ [Vault] Failed to initialize Vault: ${error instanceof Error ? error.message : error}`,
    );
    return false;
  }
}
