import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForumThread } from '../../hooks/useForumThread';
import * as AuthContext from '../../context/AuthContext';
import * as ReactRouter from 'react-router';
import * as ReactQuery from '@tanstack/react-query';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, defaultVal?: string) => defaultVal || k,
    i18n: { language: 'es' },
  }),
}));

describe('useForumThread Hook', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ReactRouter.useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(ReactRouter.useParams).mockReturnValue({ type: 'topic', id: 'sample-thread' });
    vi.mocked(ReactQuery.useQuery).mockReturnValue({
      data: {
        thread: {
          id: 'sample-thread',
          title: 'Sample Thread Title',
          content: 'Sample thread content body',
          author: 'TestUser',
          author_id: 'user-123',
          author_avatar: null,
          author_role: 'user',
          date: '01/10/2026',
          longDate: '01/10/2026 12:00',
          image: null,
          tag: 'General',
          category_id: 2,
          views: 42,
          poll: null,
          pinned: false,
          locked: false,
        },
        comments: [
          {
            id: 'c1',
            user: 'Commenter',
            user_id: 'user-456',
            avatar: null,
            role: 'user',
            date: '01/10/2026',
            content: 'First comment',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as any);
  });

  it('determines admin privileges correctly', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        user_metadata: { role: 'admin', username: 'SuperAdmin' },
      },
    } as any);

    const { result } = renderHook(() => useForumThread());
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isOwnerOrAdmin('any-user-id')).toBe(true);
  });

  it('identifies non-admin owner privileges correctly', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: {
        id: 'user-123',
        user_metadata: { role: 'user', username: 'NormalUser' },
      },
    } as any);

    const { result } = renderHook(() => useForumThread());
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isOwnerOrAdmin('user-123')).toBe(true);
    expect(result.current.isOwnerOrAdmin('other-id')).toBe(false);
  });

  it('opens delete confirmation modal for thread and comment', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: 'admin-1', user_metadata: { role: 'admin' } },
    } as any);

    const { result } = renderHook(() => useForumThread());

    act(() => {
      result.current.handleDeleteThread();
    });
    expect(result.current.deleteModal).toEqual({ type: 'thread', id: 'sample-thread' });

    act(() => {
      result.current.handleDeletePost('c1');
    });
    expect(result.current.deleteModal).toEqual({ type: 'post', id: 'c1' });

    act(() => {
      result.current.closeDeleteModal();
    });
    expect(result.current.deleteModal).toBeNull();
  });

  it('handles inline edit mode state transitions', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: 'user-123', user_metadata: { role: 'user' } },
    } as any);

    const { result } = renderHook(() => useForumThread());

    act(() => {
      result.current.startEditThread();
    });
    expect(result.current.isEditingThread).toBe(true);
    expect(result.current.editThreadData.title).toBe('Sample Thread Title');

    act(() => {
      result.current.cancelEditThread();
    });
    expect(result.current.isEditingThread).toBe(false);
  });
});
