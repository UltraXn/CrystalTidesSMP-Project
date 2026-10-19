import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createCrashReportSchema } from '@crystaltides/shared';
import app from '../app.js';
import { sanitizeServerCrashSnippet } from '../controllers/crashReportController.js';
import {
  getServerBenchmarks,
  clearBenchmarkCache,
  BENCHMARK_TTL_MS,
  getPlayerStats,
} from '../services/playerStatsService.js';
import * as logService from '../services/logService.js';
import db from '../config/database.js';

describe('Crash Report & Dynamic Inflation Benchmarks Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearBenchmarkCache();
  });

  describe('1. Zod Validation - createCrashReportSchema', () => {
    it('accepts a fully valid crash report payload', () => {
      const validPayload = {
        body: {
          crashType: 'OUT_OF_MEMORY',
          exitCode: -1,
          title: 'Minecraft crashed with Out of Memory',
          offendingMod: 'sodium',
          mcVersion: '1.20.1',
          os: 'Windows 11',
          logSnippet: 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space',
        },
      };

      const result = createCrashReportSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.crashType).toBe('OUT_OF_MEMORY');
        expect(result.data.body.title).toBe('Minecraft crashed with Out of Memory');
      }
    });

    it('accepts a minimal valid payload with optional fields omitted', () => {
      const minimalPayload = {
        body: {
          crashType: 'GENERIC_CRASH',
          title: 'Unexpected crash',
        },
      };

      const result = createCrashReportSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.crashType).toBe('GENERIC_CRASH');
      }
    });

    it('rejects an invalid crashType enum value', () => {
      const invalidPayload = {
        body: {
          crashType: 'INVALID_CRASH_TYPE',
          title: 'Bad Type',
        },
      };

      const result = createCrashReportSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('rejects an empty or whitespace-only title', () => {
      const invalidPayload = {
        body: {
          crashType: 'MIXIN_CONFLICT',
          title: '   ',
        },
      };

      const result = createCrashReportSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('rejects a title that exceeds 200 characters', () => {
      const invalidPayload = {
        body: {
          crashType: 'GRAPHICS_DRIVER',
          title: 'A'.repeat(201),
        },
      };

      const result = createCrashReportSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer exit codes', () => {
      const invalidPayload = {
        body: {
          crashType: 'JAVA_MISMATCH',
          title: 'Java Version Mismatch',
          exitCode: 1.5,
        },
      };

      const result = createCrashReportSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('rejects payloads missing body wrapper', () => {
      const invalidPayload = {
        crashType: 'MISSING_DEPENDENCY',
        title: 'Missing Indium',
      };

      const result = createCrashReportSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('2. Sanitization - sanitizeServerCrashSnippet', () => {
    it('returns empty string for null, undefined, or empty snippet', () => {
      expect(sanitizeServerCrashSnippet(undefined)).toBe('');
      expect(sanitizeServerCrashSnippet('')).toBe('');
      expect(sanitizeServerCrashSnippet('   ')).toBe('   ');
    });

    it.each([
      {
        description: 'Minecraft authentication --accessToken tokens',
        raw: 'java -jar client.jar --username Steve --accessToken eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token123 --version 1.20.1',
        expected: '--accessToken [REDACTED]',
        unexpected: 'token123',
      },
      {
        description: 'Minecraft launcher --uuid flags',
        raw: 'java -jar client.jar --uuid 12345678-abcd-ef01-2345-6789abcdef01 --version 1.20.1',
        expected: '--uuid [REDACTED]',
        unexpected: '12345678-abcd-ef01-2345-6789abcdef01',
      },
      {
        description: 'HTTP Bearer tokens',
        raw: 'Authorization: Bearer secret_bearer_token_xyz987 HTTP/1.1',
        expected: 'Bearer [REDACTED]',
        unexpected: 'secret_bearer_token_xyz987',
      },
      {
        description: 'Session ID strings',
        raw: 'Session ID is token:987654321_secret_session',
        expected: 'Session ID is [REDACTED]',
        unexpected: '987654321_secret_session',
      },
      {
        description: 'JSON accessToken fields',
        raw: '{"user": "Steve", "accessToken": "eyJhbGciOiJIUzI1NiJ9.secret_jwt", "expires": 3600}',
        expected: '"accessToken": "[REDACTED]"',
        unexpected: 'secret_jwt',
      },
      {
        description: 'JSON access_token fields',
        raw: '{"token_type": "bearer", "access_token": "ya29.a0AfH6SMA_secret_oauth"}',
        expected: '"access_token": "[REDACTED]"',
        unexpected: 'ya29.a0AfH6SMA_secret_oauth',
      },
      {
        description: 'Windows user profile directories to prevent OS username leaks',
        raw: 'Crash in C:\\Users\\Administrator\\AppData\\Roaming\\.minecraft\\logs\\latest.log',
        expected: 'C:\\Users\\[USER]\\AppData\\Roaming\\.minecraft\\logs\\latest.log',
        unexpected: 'Administrator',
      },
      {
        description: 'Linux user directories (/home/username)',
        raw: 'Failed at /home/minecraft_admin/.minecraft/config/sodium-options.json',
        expected: '/home/[USER]/.minecraft/config/sodium-options.json',
        unexpected: 'minecraft_admin',
      },
      {
        description: 'macOS user directories (/Users/username)',
        raw: 'Error at /Users/developer_john/Library/Application Support/minecraft/logs',
        expected: '/Users/[USER]/Library/Application Support/minecraft/logs',
        unexpected: 'developer_john',
      },
    ])('redacts $description', ({ raw, expected, unexpected }) => {
      const sanitized = sanitizeServerCrashSnippet(raw);
      expect(sanitized).toContain(expected);
      expect(sanitized).not.toContain(unexpected);
    });
  });

  describe('3. Dynamic Inflation & Top 1 Benchmarks in playerStatsService', () => {
    it('returns safe default fallback benchmarks when database is empty or unconfigured', async () => {
      clearBenchmarkCache();
      const benchmarks = await getServerBenchmarks();

      expect(benchmarks.top1MercaderScore).toBe(500);
      expect(benchmarks.top1ConstructorScore).toBe(100000);
      expect(benchmarks.top1LuchadorScore).toBe(5000);
      expect(benchmarks.top1ConstanciaScore).toBe(900);
      expect(benchmarks.top1ExploradorScore).toBe(3000);
      expect(benchmarks.topMercaderUuid).toBeNull();
      expect(benchmarks.maxMoney).toBe(0);
    });

    it('caches benchmarks in memory within BENCHMARK_TTL_MS', async () => {
      clearBenchmarkCache();
      const first = await getServerBenchmarks();
      const second = await getServerBenchmarks();

      expect(first).toBe(second);
      expect(BENCHMARK_TTL_MS).toBe(5 * 60 * 1000);
    });

    it('calculates logarithmic top1MercaderScore accurately with inflation scale', async () => {
      clearBenchmarkCache();

      // Mock database returning 10,000,000 (10M) max money
      vi.spyOn(db, 'query').mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('plan_extension_user_values')) {
          return [
            [
              {
                uuid: 'mock-top-rich-uuid',
                double_value: 10_000_000,
                string_value: '10000000.00',
              },
            ],
            [],
          ] as unknown as [unknown[], unknown[]];
        }
        return [[], []] as unknown as [unknown[], unknown[]];
      });

      const benchmarks = await getServerBenchmarks();

      // 100 * log10(10,000,000) = 100 * 7 = 700
      expect(benchmarks.top1MercaderScore).toBe(700);
      expect(benchmarks.topMercaderUuid).toBe('mock-top-rich-uuid');
      expect(benchmarks.maxMoney).toBe(10_000_000);
    });

    it('enforces floor of 500 when max money is below or equal to 100,000', async () => {
      clearBenchmarkCache();

      vi.spyOn(db, 'query').mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('plan_extension_user_values')) {
          return [
            [
              {
                uuid: 'mock-modest-rich-uuid',
                double_value: 50_000,
                string_value: '50000.00',
              },
            ],
            [],
          ] as unknown as [unknown[], unknown[]];
        }
        return [[], []] as unknown as [unknown[], unknown[]];
      });

      const benchmarks = await getServerBenchmarks();

      // log10(50,000) ~ 4.69 -> 469 -> floor is 500
      expect(benchmarks.top1MercaderScore).toBe(500);
      expect(benchmarks.maxMoney).toBe(50_000);
    });

    it('calculates single-player combined combat_points for Luchador without cross-player summing', async () => {
      clearBenchmarkCache();

      vi.spyOn(db, 'query').mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('combat_points')) {
          return [
            [
              {
                uuid: 'fighter-uuid-alpha',
                combat_points: 6200,
              },
            ],
            [],
          ] as unknown as [unknown[], unknown[]];
        }
        return [[], []] as unknown as [unknown[], unknown[]];
      });

      const benchmarks = await getServerBenchmarks();

      expect(benchmarks.top1LuchadorScore).toBe(6200);
      expect(benchmarks.topLuchadorUuid).toBe('fighter-uuid-alpha');
    });

    it('prevents false positives in isTop1Mercader caused by logarithmic rounding collisions', async () => {
      clearBenchmarkCache();

      // Top merchant has 101,100 KC, while another player has 100,000 KC
      // Both 100,000 and 101,100 yield Math.round(100 * log10(x)) = 500
      const topMerchantUuid = '00000000-0000-0000-0000-000000000001';
      const secondPlayerUuid = '00000000-0000-0000-0000-000000000002';

      vi.spyOn(db, 'query').mockImplementation(async (sql: string, params?: unknown[]) => {
        const queryStr = String(sql);

        if (
          queryStr.includes('plan_extension_user_values') &&
          queryStr.includes('LIMIT 1') &&
          !params
        ) {
          return [
            [
              {
                uuid: topMerchantUuid,
                double_value: 101_100,
                string_value: '101100.00',
              },
            ],
            [],
          ] as unknown as [unknown[], unknown[]];
        }

        if (queryStr.includes('FROM plan_users WHERE name =')) {
          return [
            [
              {
                uuid: secondPlayerUuid,
                name: 'SecondPlayer',
                id: 42,
                registered: new Date('2026-01-01'),
              },
            ],
            [],
          ] as unknown as [unknown[], unknown[]];
        }

        if (queryStr.includes('plan_extension_user_values') && params?.[0] === secondPlayerUuid) {
          return [
            [
              {
                vault_balance: 100_000,
                vault_balance_str: '100000.00',
              },
            ],
            [],
          ] as unknown as [unknown[], unknown[]];
        }

        return [[], []] as unknown as [unknown[], unknown[]];
      });

      const stats = await getPlayerStats('SecondPlayer');
      expect(stats).not.toBeNull();
      // SecondPlayer has 100,000 KC (score 500), but maxMoney is 101,100 KC
      // Under the old bug, 500 >= 500 resulted in true!
      // Now with maxMoney validation, it correctly flags false.
      expect(stats?.is_top1_mercader).toBe(false);
      expect(stats?.raw_money).toBe(100_000);
      expect(stats?.top1MercaderScore).toBe(500);
    });
  });

  describe('4. HTTP Endpoint POST /api/launcher/crash-report', () => {
    it('returns 201 Created and acknowledges received crash report with sanitized flag', async () => {
      const response = await request(app).post('/api/launcher/crash-report').send({
        crashType: 'OUT_OF_MEMORY',
        exitCode: -1,
        title: 'Client crash with OOM',
        offendingMod: 'sodium',
        mcVersion: '1.20.1',
        os: 'Windows 11',
        logSnippet: 'Crash at C:\\Users\\SecretUser\\AppData with --accessToken token123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: {
          received: true,
          crashType: 'OUT_OF_MEMORY',
          sanitized: true,
        },
      });
    });

    it('sanitizes sensitive tokens and paths in title before logging telemetry', async () => {
      const createLogSpy = vi.spyOn(logService, 'createLog').mockResolvedValue(null);

      const response = await request(app).post('/api/launcher/crash-report').send({
        crashType: 'CORRUPTED_CONFIG',
        title: 'Crash at C:\\Users\\AdminUser\\Config with --accessToken secret_token_xyz',
        logSnippet: 'Corrupted json in config directory',
      });

      expect(response.status).toBe(201);
      expect(createLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'LAUNCHER_CRASH_REPORT',
          details: expect.objectContaining({
            title: expect.not.stringContaining('AdminUser'),
          }),
        }),
      );
      expect(createLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            title: expect.stringContaining('C:\\Users\\[USER]'),
          }),
        }),
      );
    });

    it('returns 400 Bad Request when request body violates Zod schema', async () => {
      const response = await request(app).post('/api/launcher/crash-report').send({
        crashType: 'INVALID_CRASH_NAME',
        title: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
      expect(Array.isArray(response.body.details)).toBe(true);
    });
  });
});
