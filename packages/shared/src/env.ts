import { z } from 'zod';

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required in server runtime'),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const clientEnvSchema = z.object({
  MODE: z.string().optional(),
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL').optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates environment variables fail-fast at boot time.
 * Throws a clean descriptive error if required environment variables are missing or malformed.
 */
export function validateEnv<T extends z.ZodTypeAny>(
  schema: T,
  rawEnv: Record<string, unknown>
): z.infer<T> {
  const parsed = schema.safeParse(rawEnv);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue: z.ZodIssue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');
    throw new Error(
      `[ENV VALIDATION FAILED] Variables de entorno inválidas o faltantes:\n${errorDetails}`
    );
  }
  return parsed.data;
}
