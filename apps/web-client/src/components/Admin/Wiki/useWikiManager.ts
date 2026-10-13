import { useState } from 'react';
import { WikiArticle } from '../../../services/wikiService';
import {
  useWikiArticles,
  useCreateWikiArticle,
  useUpdateWikiArticle,
  useDeleteWikiArticle,
} from '../../../hooks/useAdminData';

export function useWikiManager(mockArticles?: WikiArticle[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMod, setSelectedMod] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [has3dOnly, setHas3dOnly] = useState<boolean>(false);

  // TanStack Query Hooks
  const { data: fetchArticlesData = [], isLoading: loading } = useWikiArticles();
  const createMutation = useCreateWikiArticle();
  const updateMutation = useUpdateWikiArticle();
  const deleteMutation = useDeleteWikiArticle();

  const articles =
    mockArticles ||
    (Array.isArray(fetchArticlesData)
      ? fetchArticlesData
      : (fetchArticlesData as { data?: WikiArticle[] })?.data || []);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<WikiArticle> | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);

  // Extract unique Mods list from articles + saved custom mods
  const savedCustomMods = JSON.parse(localStorage.getItem('crystaltides_custom_mods') ?? '[]');
  const availableMods = Array.from(
    new Set([
      ...articles
        .map((a: WikiArticle) => a.boss_mod_name)
        .filter((mod): mod is string => Boolean(mod?.trim())),
      ...savedCustomMods,
    ]),
  ).toSorted((a, b) => a.localeCompare(b));

  const handleSave = async (formData: Partial<WikiArticle>) => {
    if (!formData.title || !formData.slug || !formData.content) return;

    const payload = {
      ...formData,
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      category: formData.category ?? 'general',
      description: formData.description ?? formData.content.substring(0, 100),
    } as WikiArticle & { description: string };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => setIsEditing(false),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setIsEditing(false),
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteArticleId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteArticleId) return;
    deleteMutation.mutate(deleteArticleId, {
      onSuccess: () => {
        setDeleteArticleId(null);
      },
      onError: (err) => {
        alert(err instanceof Error ? err.message : 'Error al eliminar el artículo');
      },
    });
  };

  const startEdit = (article: WikiArticle) => {
    setCurrentArticle(article);
    setEditingId(article.id);
    setIsEditing(true);
  };

  const startNew = () => {
    setCurrentArticle(null);
    setEditingId(null);
    setIsEditing(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMod('all');
    setSelectedCategory('all');
    setHas3dOnly(false);
  };

  const filteredArticles = articles.filter((a: WikiArticle) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.boss_mod_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMod = selectedMod === 'all' || a.boss_mod_name === selectedMod;
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matches3d = !has3dOnly || Boolean(a.model_3d_url);

    return matchesSearch && matchesMod && matchesCategory && matches3d;
  });

  const isFiltered =
    searchTerm !== '' || selectedMod !== 'all' || selectedCategory !== 'all' || has3dOnly;

  return {
    loading,
    articles,
    filteredArticles,
    searchTerm,
    setSearchTerm,
    selectedMod,
    setSelectedMod,
    selectedCategory,
    setSelectedCategory,
    has3dOnly,
    setHas3dOnly,
    availableMods,
    isEditing,
    setIsEditing,
    currentArticle,
    editingId,
    saving: createMutation.isPending || updateMutation.isPending,
    deleteArticleId,
    setDeleteArticleId,
    handleSave,
    handleDeleteClick,
    handleConfirmDelete,
    startEdit,
    startNew,
    resetFilters,
    isFiltered,
  };
}
