import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import Blog from '../../pages/Blog';
import { renderWithProviders } from '../../utils/test-utils';
import { supabase } from '../../services/supabaseClient';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('../../hooks/useSEO', () => ({
  useSEO: vi.fn(),
}));

describe('Blog Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders articles with server likes count and does not call Math.random during render', async () => {
    const mathRandomSpy = vi.spyOn(Math, 'random');

    const mockArticles = [
      {
        id: 101,
        title: 'Noticia del Servidor 1',
        category: 'Anuncio',
        created_at: '2026-10-18T00:00:00.000Z',
        content: 'Contenido de la primera noticia.',
        status: 'Published',
        likes_count: 42,
      },
      {
        id: 102,
        title: 'Noticia del Servidor 2',
        category: 'Evento',
        created_at: '2026-10-18T01:00:00.000Z',
        content: 'Contenido de la segunda noticia.',
        status: 'Published',
        likes_count: 17,
      },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockArticles),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    renderWithProviders(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('Noticia del Servidor 1')).toBeInTheDocument();
      expect(screen.getByText('Noticia del Servidor 2')).toBeInTheDocument();
    });

    // Verify server likes count are rendered
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();

    // Verify Math.random was NOT called for likes or particles on render
    expect(mathRandomSpy).not.toHaveBeenCalled();
    mathRandomSpy.mockRestore();
  });

  it('redirects to /login when unauthenticated user clicks like', async () => {
    const mockArticles = [
      {
        id: 101,
        title: 'Noticia para dar like',
        category: 'Anuncio',
        created_at: '2026-10-18T00:00:00.000Z',
        content: 'Contenido de la noticia.',
        status: 'Published',
        likes_count: 5,
      },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockArticles),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderWithProviders(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('Noticia para dar like')).toBeInTheDocument();
    });

    const likeButtons = screen.getAllByTestId('like-button');
    expect(likeButtons.length).toBeGreaterThan(0);
    fireEvent.click(likeButtons[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('allows authenticated user to like an article and updates server count', async () => {
    const mockArticles = [
      {
        id: 101,
        title: 'Noticia para dar like auth',
        category: 'Anuncio',
        created_at: '2026-10-18T00:00:00.000Z',
        content: 'Contenido de la noticia.',
        status: 'Published',
        likes_count: 5,
      },
    ];

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockArticles),
        });
      }
      if (url.endsWith('/news/likes/mine')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ liked_ids: [] }),
        });
      }
      if (url.endsWith('/news/101/like') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, liked: true, likes_count: 6 }),
        });
      }
      return Promise.reject(new Error(`Unknown url: ${url}`));
    });

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: {
        session: {
          access_token: 'auth-token-xyz',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'refresh',
          user: {
            id: 'usr-123',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '',
          },
        },
      },
      error: null,
    });

    renderWithProviders(<Blog />, {
      auth: {
        user: {
          id: 'usr-123',
          email: 'test@example.com',
        } as unknown as import('@supabase/supabase-js').User,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Noticia para dar like auth')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    const likeButtons = screen.getAllByTestId('like-button');
    expect(likeButtons.length).toBeGreaterThan(0);
    fireEvent.click(likeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('💙')).toBeInTheDocument();
    });
  });

  it('hides like button for fallback articles', async () => {
    // Return empty array from fetch, so fallback articles are used
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderWithProviders(<Blog />);

    await waitFor(() => {
      expect(
        screen.getByText('Lanzamiento Oficial de CrystalTides SMP 1.21.1'),
      ).toBeInTheDocument();
    });

    // Fallback article has id 'fallback-1', LikeButton returns null
    const likeButtons = screen.queryAllByTestId('like-button');
    expect(likeButtons.length).toBe(0);
  });
});
