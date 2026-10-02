import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWikiData } from '../../hooks/useWikiData';
import * as wikiService from '../../services/wikiService';
import { FALLBACK_ARTICLES } from '../../data/fallbackArticles';

vi.mock('../../services/wikiService', () => ({
  getWikiArticles: vi.fn(),
  getWikiArticle: vi.fn(),
}));

describe('useWikiData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with fallback articles on fetch failure', async () => {
    vi.mocked(wikiService.getWikiArticles).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useWikiData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.articles.length).toBeGreaterThan(0);
    expect(result.current.articles[0].slug).toBe(FALLBACK_ARTICLES[0].slug);
  });

  it('merges remote articles with fallback articles correctly', async () => {
    const mockRemote = [
      {
        id: 'remote-1',
        slug: 'ender-dragon',
        title: '• #1 Ender Dragon Imperial',
        category: 'bosses',
        content: 'Remote content',
        boss_hp: '500 HP',
      },
    ];

    vi.mocked(wikiService.getWikiArticles).mockResolvedValue(mockRemote as any);

    const { result } = renderHook(() => useWikiData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const enderDragon = result.current.articles.find((a) => a.slug === 'ender-dragon');
    expect(enderDragon).toBeDefined();
    expect(enderDragon?.title).toBe('Ender Dragon Imperial');
    expect(enderDragon?.boss_hp).toBe('500 HP');
  });

  it('filters portal articles based on portalSearch term', async () => {
    vi.mocked(wikiService.getWikiArticles).mockResolvedValue([]);

    const { result } = renderHook(() => useWikiData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setPortalSearch('wither');
    });

    expect(result.current.portalArticles.length).toBeGreaterThan(0);
    expect(
      result.current.portalArticles.every(
        (a) =>
          a.title.toLowerCase().includes('wither') ||
          a.category.toLowerCase().includes('wither') ||
          (a.boss_mod_name || '').toLowerCase().includes('wither') ||
          (a.content || '').toLowerCase().includes('wither'),
      ),
    ).toBe(true);
  });

  it('computes category counts accurately', async () => {
    vi.mocked(wikiService.getWikiArticles).mockResolvedValue([]);

    const { result } = renderHook(() => useWikiData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categoryCounts.bosses).toBeGreaterThanOrEqual(0);
    expect(result.current.categoryCounts.hostiles).toBeGreaterThanOrEqual(0);
    expect(result.current.categoryCounts.critters).toBeGreaterThanOrEqual(0);
    expect(result.current.categoryCounts.guides).toBeGreaterThanOrEqual(0);
  });

  it('loads specific article detail when slug is provided', async () => {
    const mockDetail = {
      id: 'wither-detail',
      slug: 'wither-storm',
      title: 'Wither Storm',
      category: 'bosses',
      content: 'Detailed lore',
      boss_hp: '1000 HP',
    };

    vi.mocked(wikiService.getWikiArticles).mockResolvedValue([]);
    vi.mocked(wikiService.getWikiArticle).mockResolvedValue(mockDetail as any);

    const { result } = renderHook(() => useWikiData('wither-storm'));

    await waitFor(() => {
      expect(result.current.currentArticle?.slug).toBe('wither-storm');
    });

    expect(result.current.currentArticle?.boss_hp).toBe('1000 HP');
    expect(result.current.isMobArticle).toBe(true);
  });
});
