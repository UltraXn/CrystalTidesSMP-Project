import vault from 'node-vault';

/**
 * Initializes the HashiCorp Vault client and loads secrets into process.env.
 * If VAULT_ADDR or VAULT_TOKEN are not set, it falls back to local environment variables.
 */
export async function initVault(): Promise<void> {
  const vaultAddr = process.env.VAULT_ADDR;
  const vaultToken = process.env.VAULT_TOKEN;
  const secretPath = process.env.VAULT_SECRET_PATH || 'secret/data/crystaltides';

  if (!vaultAddr || !vaultToken) {
    console.log('🔑 [Vault] VAULT_ADDR or VAULT_TOKEN not set. Using local .env fallback.');
    return;
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
      const errMsg = '❌ [Vault] Vault server is sealed. Cannot fetch secrets.';
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errMsg);
      } else {
        console.warn(`${errMsg} Falling back to local .env.`);
        return;
      }
    }

    console.log(`🔑 [Vault] Fetching secrets from path: ${secretPath}`);
    const response = await client.read(secretPath);

    // KV v2 engine stores data under response.data.data
    // KV v1 engine stores data under response.data
    let secrets: Record<string, string> | undefined;

    if (response && response.data) {
      if (response.data.data) {
        secrets = response.data.data; // KV v2
      } else {
        secrets = response.data; // KV v1 fallback
      }
    }

    if (!secrets || Object.keys(secrets).length === 0) {
      throw new Error(`No secrets found at path ${secretPath}`);
    }

    // Inject secrets into process.env
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value;
    }

    console.log(`✅ [Vault] Loaded ${Object.keys(secrets).length} secrets into environment.`);
  } catch (error: any) {
    const errMsg = `❌ [Vault] Failed to initialize Vault: ${error.message || error}`;
    if (process.env.NODE_ENV === 'production') {
      console.error(errMsg);
      throw error;
    } else {
      console.warn(`${errMsg} Falling back to local .env.`);
    }
  }
}
