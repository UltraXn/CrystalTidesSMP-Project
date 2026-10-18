import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const client = {
  health: vi.fn(),
  read: vi.fn(),
  tokenRenewSelf: vi.fn(),
};
const vaultFactory = vi.fn(() => client);
vi.mock('node-vault', () => ({ default: vaultFactory }));

const { initVault } = await import('../../services/vaultService.js');

const SECRET_KEY = 'VAULT_TEST_INJECTED_SECRET';

describe('initVault', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.env.VAULT_ADDR = 'https://vault.test.invalid';
    process.env.VAULT_TOKEN = 'test-periodic-token';
    client.health.mockResolvedValue({ sealed: false });
    client.read.mockResolvedValue({ data: { data: { [SECRET_KEY]: 'from-vault' } } });
    client.tokenRenewSelf.mockResolvedValue({});
  });

  afterEach(() => {
    process.env.VAULT_ADDR = '';
    process.env.VAULT_TOKEN = '';
    delete process.env[SECRET_KEY];
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('falls back to the local environment without Vault settings', async () => {
    process.env.VAULT_TOKEN = '';

    await expect(initVault()).resolves.toBe(true);
    expect(vaultFactory).not.toHaveBeenCalled();
  });

  it('loads the secrets and renews the periodic token', async () => {
    await expect(initVault()).resolves.toBe(true);

    expect(process.env[SECRET_KEY]).toBe('from-vault');
    expect(client.tokenRenewSelf).toHaveBeenCalledTimes(1);
  });

  it('still starts when the renewal fails: the token is valid right now', async () => {
    client.tokenRenewSelf.mockRejectedValue(new Error('permission denied'));

    await expect(initVault()).resolves.toBe(true);
    expect(process.env[SECRET_KEY]).toBe('from-vault');
  });

  it('does not renew or load anything while Vault is sealed', async () => {
    client.health.mockResolvedValue({ sealed: true });

    await expect(initVault()).resolves.toBe(false);
    expect(client.read).not.toHaveBeenCalled();
    expect(client.tokenRenewSelf).not.toHaveBeenCalled();
  });
});
