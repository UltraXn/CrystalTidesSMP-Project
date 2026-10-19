import { z } from 'zod';

export const crashTypeSchema = z.enum([
  'OUT_OF_MEMORY',
  'MIXIN_CONFLICT',
  'GRAPHICS_DRIVER',
  'CORRUPTED_CONFIG',
  'JAVA_MISMATCH',
  'MISSING_DEPENDENCY',
  'GENERIC_CRASH',
]);

export const crashReportPayloadSchema = z.object({
  crashType: crashTypeSchema,
  exitCode: z.number().int().nullable().optional(),
  title: z.string().trim().min(1).max(200),
  offendingMod: z.string().trim().max(120).nullable().optional(),
  mcVersion: z.string().trim().max(64).optional(),
  os: z.string().trim().max(32).optional(),
  logSnippet: z.string().max(8000).optional(),
});

export const createCrashReportSchema = z.object({
  body: crashReportPayloadSchema,
});

export type CrashType = z.infer<typeof crashTypeSchema>;
export type CrashReportPayload = z.infer<typeof crashReportPayloadSchema>;
export type CreateCrashReportInput = z.infer<typeof createCrashReportSchema>;
