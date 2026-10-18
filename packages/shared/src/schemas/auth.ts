import { z } from 'zod';

export const loginPayloadSchema = z.object({
  email: z.string().regex(/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/, 'Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerPayloadSchema = z
  .object({
    email: z.string().regex(/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/, 'Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password too long'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username too long')
      .regex(/^\w+$/, 'Username can only contain letters, numbers and underscores'),
    minecraft_nick: z.string().optional(),
    confirmPassword: z.string().optional(),
    website: z.string().optional(), // Honeypot field for bot detection
    confirm_email: z.string().optional(), // Form honeypot field for bot detection
    turnstileToken: z.string().optional(), // Cloudflare Turnstile token
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const verify2FAPayloadSchema = z.object({
  token: z
    .string()
    .length(6, 'The token must be 6 digits long')
    .regex(/^\d+$/, 'The token must contain only digits'),
});

export const enable2FAPayloadSchema = z.object({
  token: z
    .string()
    .length(6, 'The token must be 6 digits long')
    .regex(/^\d+$/, 'The token must contain only digits'),
  // Ignored by the server (it uses its own pending secret); still accepted from older clients.
  secret: z.string().min(16, 'Secret is invalid').optional(),
});

// Express route wrapper schemas
export const registerSchema = z.object({
  body: registerPayloadSchema,
});

export const loginSchema = z.object({
  body: loginPayloadSchema,
});

export const verify2FASchema = z.object({
  body: verify2FAPayloadSchema,
});

export const enable2FASchema = z.object({
  body: enable2FAPayloadSchema,
});

export const disable2FASchema = z.object({
  body: verify2FAPayloadSchema,
});

// Form-compatible aliases for web-client
export const loginFormSchema = loginPayloadSchema;
export const registerFormSchema = registerPayloadSchema;

// Inferred TypeScript types
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type Verify2FAPayload = z.infer<typeof verify2FAPayloadSchema>;
export type Enable2FAPayload = z.infer<typeof enable2FAPayloadSchema>;

export type LoginFormValues = LoginPayload;
export type RegisterFormValues = RegisterPayload;
