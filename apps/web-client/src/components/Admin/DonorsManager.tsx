import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Plus, CheckCircle, AlertCircle, X } from 'lucide-react';
import { DropResult } from '@hello-pangea/dnd';
import Loader from '../UI/Loader';
import DonorFormModal, { Donor } from './Donors/DonorFormModal';
import DonorsList from './Donors/DonorsList';
import DonorsConfirmModal from './Donors/DonorsConfirmModal';
import { useAdminSettings, useUpdateSiteSetting } from '../../hooks/useAdminData';
import { getDefaultDonors } from './Donors/defaultDonors';

const ALERT_BORDER_COLORS: Record<string, string> = {
  error: '#ef4444',
  success: '#10b981',
  warning: '#facc15',
};

export default function DonorsManager() {
  const { t } = useTranslation();

  // TanStack Query Hooks
  const { data: adminSettings, isLoading: loading } = useAdminSettings();
  const updateSettingMutation = useUpdateSiteSetting();

  const donors = adminSettings?.donors || [];

  // Edit Modal State
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'import' | null;
    payload?: string;
  }>({ isOpen: false, type: null });

  // Custom Alert State
  const [alert, setAlert] = useState<{
    message: string;
    type: 'error' | 'success' | 'warning';
  } | null>(null);

  const handleUpdateDonors = async (newList: Donor[]) => {
    updateSettingMutation.mutate(
      {
        key: 'donors_list',
        value: JSON.stringify(newList),
      },
      {
        onSuccess: () => {
          if (!editingDonor) {
            setAlert({
              message: t('admin.donors.validation.success_save', 'Lista de donadores actualizada'),
              type: 'success',
            });
          }
        },
        onError: () => {
          setAlert({ message: t('admin.donors.validation.save_error'), type: 'error' });
        },
      },
    );
  };

  const handleImportDefaults = () => {
    setConfirmModal({ isOpen: true, type: 'import' });
  };

  const confirmAction = () => {
    if (confirmModal.type === 'delete' && confirmModal.payload) {
      const newList = donors.filter((d: Donor) => d.id !== confirmModal.payload);
      handleUpdateDonors(newList);
    } else if (confirmModal.type === 'import') {
      handleUpdateDonors(getDefaultDonors(t));
    }
    setConfirmModal({ isOpen: false, type: null });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(donors);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    handleUpdateDonors(items);
  };

  const handleEditSave = (donorData: Donor) => {
    if (!donorData.name) {
      setAlert({ message: t('admin.donors.validation.name_req'), type: 'error' });
      return;
    }
    if (!donorData.isPremium && !donorData.skinUrl) {
      setAlert({ message: t('admin.donors.validation.skin_req'), type: 'error' });
      return;
    }
    if (!donorData.description) {
      setAlert({ message: t('admin.donors.validation.desc_req'), type: 'error' });
      return;
    }

    let newList = [...donors];
    const finalDonor = {
      ...donorData,
      skinUrl: donorData.isPremium
        ? `https://minotar.net/skin/${donorData.name}`
        : donorData.skinUrl,
    };

    if (isNew) {
      finalDonor.id = Date.now().toString();
      newList.push(finalDonor);
    } else {
      newList = newList.map((d) => (d.id === donorData.id ? finalDonor : d));
    }

    handleUpdateDonors(newList);
    setEditingDonor(null);
  };

  const openNew = () => {
    setEditingDonor({
      id: '',
      name: '',
      skinUrl: '',
      description: '',
      description_en: '',
      ranks: ['donador'],
      isPremium: false,
    });
    setIsNew(true);
  };

  if (loading)
    return (
      <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}>
        <Loader />
      </div>
    );

  return (
    <div className="donor-manager-container">
      <div className="news-header">
        <div>
          <h3
            style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#fff',
            }}
          >
            <div
              style={{
                padding: '8px',
                background: 'rgba(var(--accent-rgb), 0.1)',
                borderRadius: '12px',
                display: 'flex',
                color: 'var(--accent)',
              }}
            >
              <Crown />
            </div>
            {t('admin.donors.manager_title')}
          </h3>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            {t(
              'admin.donors.manager_desc',
              'Administra la lista de honor y personaliza el perfil de cada donador.',
            )}
          </p>
        </div>
        <button type="button" className="btn-primary poll-new-btn" onClick={openNew}>
          <Plus /> {t('admin.donors.add_btn')}
        </button>
      </div>

      <DonorsList
        donors={donors}
        onDragEnd={onDragEnd}
        onEdit={(d) => {
          setEditingDonor(d);
          setIsNew(false);
        }}
        onDelete={(id) => setConfirmModal({ isOpen: true, type: 'delete', payload: id })}
        onImport={handleImportDefaults}
      />

      <DonorFormModal
        donor={editingDonor}
        isNew={isNew}
        onClose={() => setEditingDonor(null)}
        onSave={handleEditSave}
        saving={updateSettingMutation.isPending}
      />

      <DonorsConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmAction}
      />

      {/* ALERT TOAST */}
      {alert && (
        <output
          aria-live="polite"
          style={{
            display: 'block',
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000000,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${ALERT_BORDER_COLORS[alert.type] ?? '#facc15'}`,
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            {alert.type === 'error' ? (
              <AlertCircle color="#ef4444" aria-hidden="true" />
            ) : (
              <CheckCircle color="#10b981" aria-hidden="true" />
            )}
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
              {alert.message}
            </span>
            <button
              aria-label={t('common.dismiss', 'Descartar notificación')}
              type="button"
              onClick={() => setAlert(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X aria-hidden="true" />
            </button>
          </div>
        </output>
      )}
    </div>
  );
}
