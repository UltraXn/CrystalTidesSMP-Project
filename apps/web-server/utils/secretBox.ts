import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const FORMAT_VERSION = 'v1';
const IV_BYTES = 12;

/**
 * Authenticated encryption (AES-256-GCM) for small secrets stored at rest.
 * `context` is bound as additional authenticated data, so a ciphertext copied
 * into another row (e.g. another user's) fails to decrypt.
 */
export function sealSecret(plaintext: string, key: Buffer, context: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from(context, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    FORMAT_VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
}

export function openSecret(sealed: string, key: Buffer, context: string): string {
  const [version, iv, tag, ciphertext] = sealed.split(':');
  if (version !== FORMAT_VERSION || !iv || !tag || !ciphertext) {
    throw new Error('Unsupported sealed secret format');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
  decipher.setAAD(Buffer.from(context, 'utf8'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
