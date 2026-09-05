import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authenticateToken, require2FA, optionalAuthenticateToken } from '../../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../../utils/roleUtils.js';
import supabase from '../../config/supabaseClient.js';

// Mock auditService to avoid external logging overhead
vi.mock('../../services/auditService.js', () => ({
  logSecurityFailure: vi.fn().mockResolvedValue(undefined),
}));

describe('Auth Middleware Suite', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      originalUrl: '/api/test',
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe('authenticateToken', () => {
    it('returns 401 if no Authorization header is provided', async () => {
      // Arrange
      mockReq.headers = {};

      // Act
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'AUTH_ERROR',
            message: 'No authentication token provided',
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('authenticates system bot when token matches BOT_API_KEY', async () => {
      // Arrange
      process.env.BOT_API_KEY = 'secret-bot-key-123';
      mockReq.headers = { authorization: 'Bearer secret-bot-key-123' };

      // Act
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.role).toBe('owner');
      expect(mockReq.user?.username).toBe('CrystalBot');
    });

    it('returns 401 when Supabase rejects token', async () => {
      // Arrange
      mockReq.headers = { authorization: 'Bearer invalid-token-xyz' };
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid JWT' } as unknown as import('@supabase/supabase-js').AuthError,
      });

      // Act
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('successfully authenticates valid user and populates req.user', async () => {
      // Arrange
      const token = 'valid-token-for-user-1';
      mockReq.headers = { authorization: `Bearer ${token}` };

      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-uuid-1',
            email: 'player@crystaltides.net',
            user_metadata: { full_name: 'Alex' },
            app_metadata: { provider: 'email' },
          } as unknown as import('@supabase/supabase-js').User,
        },
        error: null,
      });

      // Mock profiles table lookup
      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: { username: 'AlexCrystal', role: 'developer', avatar_url: 'https://example.com/alex.png' },
          error: null,
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.id).toBe('user-uuid-1');
      expect(mockReq.user?.username).toBe('AlexCrystal');
      expect(mockReq.user?.role).toBe('developer');
    });
  });

  describe('optionalAuthenticateToken', () => {
    it('passes through and calls next() without error if no token is present', async () => {
      // Arrange
      mockReq.headers = {};

      // Act
      await optionalAuthenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });
  });

  describe('require2FA', () => {
    it('returns 401 if req.user is missing', async () => {
      // Arrange
      mockReq.user = undefined;

      // Act
      await require2FA(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('passes through if user does not have 2FA enabled', async () => {
      // Arrange
      mockReq.user = {
        id: 'user-1',
        email: 'u@test.com',
        username: 'User1',
        role: 'user',
        avatar_url: '',
        app_metadata: { two_factor_enabled: false },
      };

      // Act
      await require2FA(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('returns 403 if 2FA is enabled but no admin token provided', async () => {
      // Arrange
      mockReq.user = {
        id: 'admin-1',
        email: 'admin@test.com',
        username: 'Admin1',
        role: 'admin',
        avatar_url: '',
        app_metadata: { two_factor_enabled: true },
      };

      // Act
      await require2FA(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: '2FA_REQUIRED',
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkRole', () => {
    it('returns 403 if user role is not in allowedRoles', () => {
      // Arrange
      mockReq.user = {
        id: 'user-2',
        email: 'u2@test.com',
        username: 'StandardUser',
        role: 'user',
        avatar_url: '',
      };
      const middleware = checkRole(ADMIN_ROLES);

      // Act
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficent permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('calls next() if user role is in allowedRoles', () => {
      // Arrange
      mockReq.user = {
        id: 'admin-2',
        email: 'a2@test.com',
        username: 'AdminUser',
        role: 'admin',
        avatar_url: '',
      };
      const middleware = checkRole(ADMIN_ROLES);

      // Act
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('grants access to staff roles when checked against STAFF_ROLES', () => {
      // Arrange
      mockReq.user = {
        id: 'mod-1',
        email: 'mod@test.com',
        username: 'ModUser',
        role: 'moderator',
        avatar_url: '',
      };
      const middleware = checkRole(STAFF_ROLES);

      // Act
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
