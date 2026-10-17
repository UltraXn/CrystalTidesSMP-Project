import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';
import { sealSecret, openSecret } from '../utils/secretBox.js';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET environment variable is required');
}

const TOTP_TABLE = 'user_totp_secrets';
const TOTP_STEP_SECONDS = 30;
const TOTP_WINDOW = 1; // Allow 30s drift (1 step before/after)
const ENCRYPTION_KEY_BYTES = 32;

interface TotpRecord {
  user_id: string;
  secret_ciphertext: string | null;
  pending_secret_ciphertext: string | null;
  last_used_step: number;
}

export type CodeCheck = 'valid' | 'invalid' | 'not_enrolled';

/** Raised when TOTP_ENCRYPTION_KEY is missing or malformed: 2FA fails closed. */
export class TwoFactorConfigError extends Error {
  constructor() {
    super('2FA is not configured: TOTP_ENCRYPTION_KEY must be 32 base64-encoded bytes');
    this.name = 'TwoFactorConfigError';
  }
}

function getEncryptionKey(): Buffer {
  const key = Buffer.from(process.env.TOTP_ENCRYPTION_KEY ?? '', 'base64');
  if (key.length !== ENCRYPTION_KEY_BYTES) {
    throw new TwoFactorConfigError();
  }
  return key;
}

const sealForUser = (userId: string, secret: string) =>
  sealSecret(secret, getEncryptionKey(), `totp:${userId}`);

const openForUser = (userId: string, sealed: string) =>
  openSecret(sealed, getEncryptionKey(), `totp:${userId}`);

export const generateSecret = (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `CrystalTides (${email})`,
    issuer: 'CrystalTides',
  });
  // Authy/authenticator logo support (non-standard but widely supported)
  // Ideally this should be an absolute URL to the hosted logo
  const logoUrl =
    process.env.TWO_FACTOR_LOGO_URL ??
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png';
  const otpauth_url = secret.otpauth_url
    ? `${secret.otpauth_url}&image=${encodeURIComponent(logoUrl)}`
    : secret.otpauth_url;

  return {
    otpauth_url,
    base32: secret.base32,
  };
};

export const generateQRCode = async (otpauth_url: string) => {
  return await QRCode.toDataURL(otpauth_url, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
};

/** Returns the TOTP time step `token` belongs to, or null when it does not match. */
export const matchTokenStep = (token: string, secret: string): number | null => {
  const match = speakeasy.totp.verifyDelta({
    secret,
    encoding: 'base32',
    token,
    window: TOTP_WINDOW,
  });
  if (!match) return null;
  return Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS) + match.delta;
};

export const verifyToken = (token: string, secret: string) =>
  matchTokenStep(token, secret) !== null;

async function fetchTotpRecord(userId: string): Promise<TotpRecord | null> {
  const { data, error } = await supabase
    .from(TOTP_TABLE)
    .select('user_id, secret_ciphertext, pending_secret_ciphertext, last_used_step')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as TotpRecord | null;
}

/**
 * app_metadata only carries the non-secret flag. Supabase embeds it in every
 * access token, so the legacy `two_factor_secret` key is always cleared.
 */
async function setTwoFactorFlag(userId: string, enabled: boolean): Promise<void> {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { two_factor_enabled: enabled, two_factor_secret: null },
  });
  if (error) throw error;
}

export async function isEnrolled(userId: string): Promise<boolean> {
  const record = await fetchTotpRecord(userId);
  return Boolean(record?.secret_ciphertext);
}

/** Keeps a freshly generated secret pending until the user proves they scanned it. */
export async function savePendingSecret(userId: string, secret: string): Promise<void> {
  const { error } = await supabase.from(TOTP_TABLE).upsert({
    user_id: userId,
    pending_secret_ciphertext: sealForUser(userId, secret),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Promotes the pending secret to active when `token` was generated from it. */
export async function activatePendingSecret(userId: string, token: string): Promise<CodeCheck> {
  const record = await fetchTotpRecord(userId);
  if (!record?.pending_secret_ciphertext) return 'not_enrolled';

  const step = matchTokenStep(token, openForUser(userId, record.pending_secret_ciphertext));
  if (step === null) return 'invalid';

  const { data, error } = await supabase
    .from(TOTP_TABLE)
    .update({
      secret_ciphertext: record.pending_secret_ciphertext,
      pending_secret_ciphertext: null,
      last_used_step: step,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('pending_secret_ciphertext', record.pending_secret_ciphertext)
    .select('user_id');

  if (error) throw error;
  if ((data?.length ?? 0) === 0) return 'invalid';

  await setTwoFactorFlag(userId, true);
  return 'valid';
}

/**
 * Checks `token` against the active secret. A time step can only be consumed
 * once, so an intercepted code cannot be replayed within its validity window.
 */
export async function verifyActiveCode(userId: string, token: string): Promise<CodeCheck> {
  const record = await fetchTotpRecord(userId);
  if (!record?.secret_ciphertext) return 'not_enrolled';

  const step = matchTokenStep(token, openForUser(userId, record.secret_ciphertext));
  if (step === null) return 'invalid';

  const { data, error } = await supabase
    .from(TOTP_TABLE)
    .update({ last_used_step: step, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .lt('last_used_step', step)
    .select('user_id');

  if (error) throw error;
  return (data?.length ?? 0) > 0 ? 'valid' : 'invalid';
}

export async function removeTotp(userId: string): Promise<void> {
  const { error } = await supabase.from(TOTP_TABLE).delete().eq('user_id', userId);
  if (error) throw error;
  await setTwoFactorFlag(userId, false);
}

export const signAdminToken = (userId: string, role: string) => {
  return jwt.sign({ sub: userId, role, verified: true }, ADMIN_JWT_SECRET, { expiresIn: '15m' });
};

export const verifyAdminToken = (token: string) => {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET, { algorithms: ['HS256'] }) as {
      sub: string;
      role: string;
      verified: boolean;
    };
  } catch {
    return null;
  }
};
