import { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import '../../../styles/admin/locations_manager.css';
import ConfirmationModal from '../../UI/ConfirmationModal';
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  WorldLocation,
  LocationAuthor,
} from '../../../services/locationService';
import { supabase } from '../../../services/supabaseClient';
import { useTranslation } from 'react-i18next';
import Loader from '../../UI/Loader';
import { LocationCard } from './LocationCard';
import { LocationEditorForm } from './LocationEditorForm';

const INITIAL_FORM_DATA: Partial<WorldLocation> = {
  title: '',
  description: '',
  long_description: '',
  coords: '0, 0, 0',
  image_url: '',
  is_coming_soon: false,
  authors: [],
  sort_order: 0,
};

export default function LocationsManager() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<WorldLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<WorldLocation>>(INITIAL_FORM_DATA);
  const [newAuthor, setNewAuthor] = useState<LocationAuthor>({ name: '', role: 'architect' });

  async function fetchLocations() {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchLocations();
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert(t('locations_manager.form.error_fields', 'Por favor completa los campos básicos'));
      return;
    }

    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      if (editingId) {
        await updateLocation(editingId, formData, token);
      } else {
        await createLocation(formData as Omit<WorldLocation, 'id'>, token);
      }

      resetForm();
      await fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      alert(t('locations_manager.form.error_save', 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (loc: WorldLocation) => {
    setFormData(loc);
    setEditingId(loc.id);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addAuthor = () => {
    if (!newAuthor.name) return;
    const currentAuthors = formData.authors || [];
    setFormData({ ...formData, authors: [...currentAuthors, newAuthor] });
    setNewAuthor({ name: '', role: 'architect' });
  };

  const removeAuthor = (idx: number) => {
    const currentAuthors = [...(formData.authors || [])];
    currentAuthors.splice(idx, 1);
    setFormData({ ...formData, authors: currentAuthors });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      await deleteLocation(deleteConfirmId, token);
      setDeleteConfirmId(null);
      await fetchLocations();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0' }}>
        <Loader text={t('locations_manager.loading', 'Sincronizando Lore...')} />
      </div>
    );
  }

  return (
    <div className="locations-manager-container animate-fade-in">
      <div className="manager-header">
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <MapPin style={{ color: 'var(--accent)' }} />{' '}
            {t('locations_manager.title', 'Gestor de Lugares y Lore')}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
            {t(
              'locations_manager.subtitle',
              'Administra los puntos de interés y la historia del mundo.',
            )}
          </p>
        </div>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="modal-btn-primary hover-lift"
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '16px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Plus /> {t('locations_manager.create_btn', 'Nuevo Lugar')}
          </button>
        )}
      </div>

      {isCreating && (
        <LocationEditorForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          newAuthor={newAuthor}
          setNewAuthor={setNewAuthor}
          saving={saving}
          onSave={handleSave}
          onCancel={resetForm}
          onAddAuthor={addAuthor}
          onRemoveAuthor={removeAuthor}
        />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {locations.map((loc) => (
          <LocationCard
            key={loc.id}
            location={loc}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteConfirmId(id)}
          />
        ))}
      </div>

      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        title={t('admin.locations.delete_modal.title', 'Eliminar Registro de Lore')}
        message={t(
          'admin.locations.delete_modal.msg',
          '¿Estás seguro de que quieres borrar este lugar? La historia asociada se perderá permanentemente.',
        )}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmId(null)}
        isDanger={true}
      />
    </div>
  );
}
