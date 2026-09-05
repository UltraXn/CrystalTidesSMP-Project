import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { mockStatus } = vi.hoisted(() => ({
  mockStatus: vi.fn(),
}));

vi.mock('minecraft-server-util', () => ({
  default: {
    status: mockStatus,
  },
  status: mockStatus,
}));

import app from '../../app.js';

describe('Server Status Routes (/api/server/status)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/server/status/live returns online status when Minecraft server responds', async () => {
    // Arrange
    mockStatus.mockResolvedValueOnce({
      version: { name: '1.20.1 Fabric', protocol: 763 },
      players: { online: 24, max: 100, sample: [{ name: 'Player1', id: 'uuid-1' }] },
      motd: { raw: 'MOTD', clean: 'CrystalTides SMP', html: '<span>CrystalTides</span>' },
      favicon: 'data:image/png;base64,mock',
      srvResult: null,
      roundTripLatency: 35,
    });

    // Act
    const res = await request(app).get('/api/server/status/live');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.online).toBe(true);
    expect(res.body.players.online).toBe(24);
    expect(res.body.motd).toBe('CrystalTides SMP');
  });

  it('GET /api/server/status/live returns fallback offline status gracefully when ping fails', async () => {
    // Arrange
    mockStatus.mockRejectedValueOnce(new Error('Connection timed out'));

    // Act
    const res = await request(app).get('/api/server/status/live');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.online).toBe(false);
    expect(res.body.motd).toBe('Server Unreachable');
    expect(res.body.players.online).toBe(0);
  });
});
