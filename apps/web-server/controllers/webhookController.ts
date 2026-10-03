import supabase from '../config/supabaseClient.js';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { kofiWebhookSchema, type KofiWebhookPayload } from '../schemas/donationSchemas.js';

// --- Constants & Configuration ---

const DEFAULT_DONOR_NAME = 'Anónimo';
const DONATIONS_TABLE = 'donations';
const DEFAULT_EVENT_TYPE = 'Donation';

const ERROR_MESSAGES = {
  INVALID_JSON: 'Invalid JSON format',
  SERVER_CONFIG: 'Server Configuration Error',
  INVALID_TOKEN: 'Invalid token',
  INVALID_PAYLOAD: 'Invalid payload',
  DATABASE_ERROR: 'Database error',
  SERVER_ERROR: 'Server Error',
} as const;

const SUCCESS_MESSAGES = {
  DONATION_RECORDED: 'Donation recorded',
} as const;

// --- Typed Payment Webhook Payloads & Records ---

export type PaymentEventType = 'Donation' | 'Subscription' | 'Commission' | 'Shop Order' | string;

export interface DonationDbRecord {
  message_id: string;
  created_at: string;
  type?: string;
  from_name: string;
  message?: string;
  amount: string | number;
  currency: string;
  url?: string;
  is_public: boolean;
}

export interface ParsePayloadResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export type WebhookEventHandler = (payload: KofiWebhookPayload) => Promise<void>;

// --- Helper Functions ---

/**
 * Parses raw webhook body, handling x-www-form-urlencoded payloads containing JSON strings in `data`.
 */
export const extractRawPayload = (body: unknown): ParsePayloadResult => {
  if (!body || typeof body !== 'object') {
    return { ok: true, data: body };
  }

  const payloadObj = body as Record<string, unknown>;
  if (typeof payloadObj.data !== 'string') {
    return { ok: true, data: body };
  }

  try {
    const parsed = JSON.parse(payloadObj.data);
    return { ok: true, data: parsed };
  } catch (parseError) {
    console.error('Error parsing Ko-Fi JSON string:', parseError);
    return { ok: false, error: ERROR_MESSAGES.INVALID_JSON };
  }
};

/**
 * Performs timing-safe comparison to prevent side-channel attacks on verification tokens.
 */
export const verifyKofiToken = (providedTokenRaw: unknown, expectedToken: string): boolean => {
  const providedBuffer = Buffer.from(String(providedTokenRaw ?? ''));
  const expectedBuffer = Buffer.from(expectedToken);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

/**
 * Transforms validated webhook payload into Supabase donation table entity.
 */
export const buildDonationRecord = (payload: KofiWebhookPayload): DonationDbRecord => ({
  message_id: payload.message_id,
  created_at: payload.timestamp || new Date().toISOString(),
  type: payload.type,
  from_name: payload.from_name || DEFAULT_DONOR_NAME,
  message: payload.message,
  amount: payload.amount,
  currency: payload.currency,
  url: payload.url,
  is_public: payload.is_public !== false,
});

/**
 * Upserts donation into Supabase using message_id as idempotent deduplication key.
 */
export const persistDonation = async (payload: KofiWebhookPayload) => {
  const record = buildDonationRecord(payload);
  return await supabase.from(DONATIONS_TABLE).upsert(record, { onConflict: 'message_id' }).select();
};

/**
 * Optional Discord notification dispatcher.
 */
export const dispatchDiscordAlert = async (payload: KofiWebhookPayload): Promise<void> => {
  try {
    const { sendDonationAlert } = await import('../services/discordService.js');
    await sendDonationAlert({
      from_name: payload.from_name || DEFAULT_DONOR_NAME,
      amount: String(payload.amount),
      currency: payload.currency,
      message: payload.message,
    });
  } catch (discordErr) {
    console.error('Failed to send Discord alert, but donation was saved:', discordErr);
  }
};

// --- Event Routing Dictionary ---

export const EVENT_ROUTING_DICTIONARY: Record<string, WebhookEventHandler> = {
  Donation: async (payload: KofiWebhookPayload) => {
    await dispatchDiscordAlert(payload);
  },
  Subscription: async (payload: KofiWebhookPayload) => {
    console.log(`[Webhook] Subscription event received: message_id=${payload.message_id}`);
    await dispatchDiscordAlert(payload);
  },
  Commission: async (payload: KofiWebhookPayload) => {
    console.log(`[Webhook] Commission event received: message_id=${payload.message_id}`);
    await dispatchDiscordAlert(payload);
  },
  'Shop Order': async (payload: KofiWebhookPayload) => {
    console.log(`[Webhook] Shop Order event received: message_id=${payload.message_id}`);
    await dispatchDiscordAlert(payload);
  },
};

/**
 * Routes payment webhook payload through the event routing dictionary.
 */
export const routeWebhookEvent = async (payload: KofiWebhookPayload): Promise<void> => {
  const eventType = payload.type || DEFAULT_EVENT_TYPE;
  const handler =
    EVENT_ROUTING_DICTIONARY[eventType] ?? EVENT_ROUTING_DICTIONARY[DEFAULT_EVENT_TYPE];
  await handler(payload);
};

// --- Main Route Controller ---

export const handleKofiWebhook = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 1. Extract payload (supporting JSON string in x-www-form-urlencoded 'data' field)
    const parsedBody = extractRawPayload(req.body);
    if (!parsedBody.ok) {
      return res.status(400).send(parsedBody.error);
    }

    // 2. Mandatory verification checks
    const verificationToken = process.env.KOFI_VERIFICATION_TOKEN;
    if (!verificationToken) {
      console.error('CRITICAL: KOFI_VERIFICATION_TOKEN is not set!');
      return res.status(500).send(ERROR_MESSAGES.SERVER_CONFIG);
    }

    const rawPayload = parsedBody.data as Record<string, unknown> | null | undefined;
    const isTokenValid = verifyKofiToken(rawPayload?.verification_token, verificationToken);
    if (!isTokenValid) {
      console.warn('Invalid Ko-Fi verification token attempt');
      return res.status(403).send(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // 3. Validate payload schema before processing
    const parseResult = kofiWebhookSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      console.warn('Invalid Ko-Fi payload schema:', parseResult.error.flatten());
      return res.status(400).send(ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    const payload = parseResult.data;
    console.log(
      `Ko-Fi Payload received: message_id=${payload.message_id}, amount=${payload.amount} ${payload.currency}`,
    );

    // 4. Idempotent database insertion
    const { error: dbError } = await persistDonation(payload);
    if (dbError) {
      console.error('Error saving query to Supabase:', dbError);
      return res.status(500).json({ error: ERROR_MESSAGES.DATABASE_ERROR });
    }

    console.log(`Donation saved: ${payload.amount} ${payload.currency} from ${payload.from_name}`);

    // 5. Dispatch through Event Routing Dictionary
    await routeWebhookEvent(payload);

    return res.status(200).send(SUCCESS_MESSAGES.DONATION_RECORDED);
  } catch (err) {
    console.error('Webhook Unexpected Error:', err);
    return res.status(500).send(ERROR_MESSAGES.SERVER_ERROR);
  }
};
