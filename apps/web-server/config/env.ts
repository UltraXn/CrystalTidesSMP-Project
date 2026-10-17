import { z } from 'zod';

/**
 * Configuration the server cannot run safely without. Validated once, after
 * Vault has injected its secrets (index.ts) and before the app is imported, so
 * a missing or weak value stops the process instead of surfacing later as a
 * 500 or, worse, a predictable fallback secret.
 *
 * Only the critical variables live here; the rest are still read from
 * process.env where they are used.
 */
const MIN_SECRET_LENGTH = 32;
const TOTP_KEY_BYTES = 32;

const secret = (name: string) =>
  z
    .string({ error: `${name} is required` })
    .min(MIN_SECRET_LENGTH, { error: `${name} must be at least ${MIN_SECRET_LENGTH} characters` });

const optionalNonEmpty = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SUPABASE_URL: z.url({ error: 'SUPABASE_URL must be a URL' }),
    SUPABASE_SERVICE_ROLE_KEY: z
      .string({ error: 'SUPABASE_SERVICE_ROLE_KEY is required' })
      .min(1, { error: 'SUPABASE_SERVICE_ROLE_KEY is required' }),
    ADMIN_JWT_SECRET: secret('ADMIN_JWT_SECRET'),
    COOKIE_SECRET: secret('COOKIE_SECRET'),
    JWT_SECRET: optionalNonEmpty,
    // Optional: without it 2FA fails closed (503) instead of stopping the server.
    TOTP_ENCRYPTION_KEY: optionalNonEmpty.refine(
      (value) => value === undefined || Buffer.from(value, 'base64').length === TOTP_KEY_BYTES,
      { error: `TOTP_ENCRYPTION_KEY must be ${TOTP_KEY_BYTES} base64-encoded bytes` },
    ),
    // Optional: without it RAG ingestion answers 500 and the WS bridge is refused.
    RAG_INGEST_SECRET: optionalNonEmpty,
    BRIDGE_WS_TOKEN: optionalNonEmpty.refine(
      (value) => value === undefined || value.length >= MIN_SECRET_LENGTH,
      { error: `BRIDGE_WS_TOKEN must be at least ${MIN_SECRET_LENGTH} characters` },
    ),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
    MOCK_DATABASE: optionalNonEmpty,
  })
  .superRefine((env, ctx) => {
    // One leaked secret must not unlock the others.
    if (env.COOKIE_SECRET === env.ADMIN_JWT_SECRET || env.COOKIE_SECRET === env.JWT_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['COOKIE_SECRET'],
        message: 'COOKIE_SECRET must not reuse ADMIN_JWT_SECRET or JWT_SECRET',
      });
    }
    if (env.NODE_ENV === 'production' && env.MOCK_DATABASE === 'true') {
      ctx.addIssue({
        code: 'custom',
        path: ['MOCK_DATABASE'],
        message: 'MOCK_DATABASE cannot be enabled in production',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/** Lists every problem by variable name; values are never included. */
export class EnvValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Invalid environment configuration:\n  - ${problems.join('\n  - ')}`);
    this.name = 'EnvValidationError';
  }
}

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }
  return result.data;
}

let cached: Env | null = null;

/** Validated configuration. The first call parses process.env and throws if it is invalid. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
