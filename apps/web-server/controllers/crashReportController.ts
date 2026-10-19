import { Request, Response } from 'express';
import { CrashReportPayload } from '@crystaltides/shared';
import { createLog } from '../services/logService.js';
import { sendInternalError } from '../utils/responseHandler.js';

/**
 * Pure function: sanitizes log snippets against credential exposure,
 * bearer tokens, access tokens, UUIDs, JSON payloads, and local filesystem user paths (defense-in-depth).
 */
export function sanitizeServerCrashSnippet(snippet?: string): string {
  if (!snippet || typeof snippet !== 'string') {
    return '';
  }

  let sanitized = snippet;

  // Redact authentication tokens, session identifiers & launcher UUID flags
  sanitized = sanitized.replace(/--accessToken\s+\S+/gi, '--accessToken [REDACTED]');
  sanitized = sanitized.replace(/--uuid\s+\S+/gi, '--uuid [REDACTED]');
  sanitized = sanitized.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');
  sanitized = sanitized.replace(/Session\s+ID\s+is\s+\S+/gi, 'Session ID is [REDACTED]');

  // Redact JSON accessToken / access_token values
  sanitized = sanitized.replace(/("accessToken"\s*:\s*")[^"]+(")/gi, '$1[REDACTED]$2');
  sanitized = sanitized.replace(/("access_token"\s*:\s*")[^"]+(")/gi, '$1[REDACTED]$2');

  // Redact user profile directory paths to prevent OS username leakage
  sanitized = sanitized.replace(/[a-z]:\\Users\\[^\\/\s]+/gi, 'C:\\Users\\[USER]');
  sanitized = sanitized.replace(/[a-z]:\/Users\/[^/\s]+/gi, 'C:/Users/[USER]');
  sanitized = sanitized.replace(/\/home\/[^/\s]+/gi, '/home/[USER]');
  sanitized = sanitized.replace(/\/Users\/[^/\s]+/gi, '/Users/[USER]');

  return sanitized;
}

/**
 * Validates if the given string is a safe HTTPS Discord webhook URL.
 * Protects against SSRF by validating protocol and host allowlist.
 */
export function isValidDiscordWebhookUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const isDiscordHost =
      parsed.hostname === 'discord.com' ||
      parsed.hostname === 'discordapp.com' ||
      parsed.hostname === 'canary.discord.com' ||
      parsed.hostname === 'ptb.discord.com';
    const isWebhookPath = parsed.pathname.startsWith('/api/webhooks/');
    return isHttps && isDiscordHost && isWebhookPath;
  } catch {
    return false;
  }
}

/**
 * Asynchronously sends an alert embed to Discord via webhook.
 * Non-blocking with 3-second timeout to avoid request latency degradation.
 */
export async function sendDiscordCrashWebhook(
  payload: CrashReportPayload,
  sanitizedSnippet?: string,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_CRASH_WEBHOOK_URL;
  if (!isValidDiscordWebhookUrl(webhookUrl)) {
    return;
  }

  const fields: { name: string; value: string; inline?: boolean }[] = [
    { name: 'Tipo de Crash', value: payload.crashType, inline: true },
    { name: 'Exit Code', value: String(payload.exitCode ?? 'N/A'), inline: true },
    { name: 'Versión MC', value: payload.mcVersion || 'N/A', inline: true },
  ];

  if (payload.offendingMod) {
    fields.push({ name: 'Mod Causante', value: payload.offendingMod, inline: true });
  }
  if (payload.os) {
    fields.push({ name: 'Sistema Operativo', value: payload.os, inline: true });
  }

  if (sanitizedSnippet && sanitizedSnippet.trim()) {
    const trimmedSnippet = sanitizedSnippet.trim().slice(0, 1000);
    fields.push({
      name: 'Snippet de Log Sanitizado',
      value: `\`\`\`text\n${trimmedSnippet}\n\`\`\``,
      inline: false,
    });
  }

  const discordPayload = {
    username: 'CrystalTides Crash Ingestion',
    embeds: [
      {
        title: `🚨 [Crash Report] ${payload.title.slice(0, 200)}`,
        color: 0xe74c3c,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: 'CrystalTides Telemetry & AppSec' },
      },
    ],
  };

  try {
    await fetch(webhookUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    console.warn('[CrashReport] Discord webhook notification failed or timed out:', error);
  }
}

/**
 * Controller: Ingests sanitized crash reports from the launcher or clients.
 */
export const submitCrashReport = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CrashReportPayload;
    const sanitizedTitle = sanitizeServerCrashSnippet(payload.title);
    const sanitizedSnippet = sanitizeServerCrashSnippet(payload.logSnippet);

    try {
      await createLog({
        action: 'LAUNCHER_CRASH_REPORT',
        details: {
          crashType: payload.crashType,
          exitCode: payload.exitCode,
          title: sanitizedTitle,
          offendingMod: payload.offendingMod,
          mcVersion: payload.mcVersion,
          os: payload.os,
          snippetLength: sanitizedSnippet.length,
        },
        source: 'launcher',
      });
    } catch (logErr) {
      console.warn('[CrashReport] Failed to create telemetry log:', logErr);
    }

    void sendDiscordCrashWebhook({ ...payload, title: sanitizedTitle }, sanitizedSnippet);

    return res.status(201).json({
      success: true,
      data: {
        received: true,
        crashType: payload.crashType,
        sanitized: true,
      },
    });
  } catch (error) {
    return sendInternalError(res, error);
  }
};
