import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCrown, FaPlus, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { DropResult } from '@hello-pangea/dnd';
import Loader from '../UI/Loader';
import { supabase } from '../../services/supabaseClient';
import { getAuthHeaders } from '../../services/adminAuth';
import DonorFormModal, { Donor } from './Donors/DonorFormModal';
import DonorsList from './Donors/DonorsList';
import DonorsConfirmModal from './Donors/DonorsConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function DonorsManager() {
    const { t } = useTranslation();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
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
    const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);

    useEffect(() => {
        const fetchDonors = async () => {
             setLoading(true);
             try {
                const res = await fetch(`${API_URL}/settings`);
                const data = await res.json();
                if (data.donors_list) {
                    const parsed = typeof data.donors_list === 'string' ? JSON.parse(data.donors_list) : data.donors_list;
                    if (Array.isArray(parsed)) setDonors(parsed);
                }
             } catch (err) {
                 console.error(err);
             } finally {
                 setLoading(false);
             }
        };
        fetchDonors();
    }, []);

    const handleSaveList = async (newList: Donor[]) => {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/settings/donors_list`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ 
                    value: JSON.stringify(newList),
                })
            });
            setDonors(newList);
            if (!editingDonor) {
                 setAlert({ message: t('admin.donors.validation.success_save', 'Lista de donadores actualizada'), type: "success" });
            }
        } catch (error) {
            console.error("Error saving donors", error);
            setAlert({ message: t('admin.donors.validation.save_error'), type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleImportDefaults = () => {
        setConfirmModal({ isOpen: true, type: 'import' });
    };

    const confirmAction = () => {
        if (confirmModal.type === 'delete' && confirmModal.payload) {
             const newList = donors.filter(d => d.id !== confirmModal.payload);
             handleSaveList(newList);
        } else if (confirmModal.type === 'import') {
             const defaults: Donor[] = [
                {
                    id: '1',
                    name: "Killu Bysmali",
                    skinUrl: "/skins/killu.png?v=fixed",
                    description: t('donors.profiles.killu'),
                    ranks: ['killu']
                },
                {
                    id: '2',
                    name: "Neroferno Ultranix",
                    skinUrl: "https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c",
                    description: t('donors.profiles.neroferno'),
                    ranks: ['neroferno']
                },
                {
                    id: '3',
                    name: "Lawchihuahua",
                    skinUrl: "/skins/law.png",
                    description: t('donors.profiles.law'),
                    ranks: ['fundador']
                },
                {
                    id: '4',
                    name: "pixiesixer",
                    skinUrl: "https://minotar.net/skin/b47ee72ad3474abe9a081ab32f47153a",
                    description: t('donors.profiles.pixie'),
                    ranks: ['fundador']
                },
                {
                    id: '5',
                    name: "Zeta",
                    skinUrl: "/skins/zeta.png",
                    description: t('donors.profiles.zeta'),
                    ranks: ['fundador']
                },
                {
                    id: '6',
                    name: "SendPles",
                    skinUrl: "https://minotar.net/skin/5bec40ab-e459-474b-b96c-21ee1eae7d29",
                    description: t('donors.profiles.sendples'),
                    ranks: ['fundador']
                },
                {
                    id: '7',
                    name: "ZenXeone",
                    skinUrl: "https://minotar.net/skin/eacfb70c-c83a-4e0b-8465-ee4b0b86e041",
                    description: t('donors.profiles.zen'),
                    ranks: ['donador']
                },
                {
                    id: '8',
                    name: "Churly",
                    skinUrl: "/skins/churly.png",
                    description: t('donors.profiles.churly'),
                    ranks: ['donador', 'developer']
                },
                {
                    id: '9',
                    name: "Nana Fubuki",
                    skinUrl: "/skins/nana-fubuki.png",
                    description: t('donors.profiles.nana'),
                    ranks: ['donador']
                }
            ];
            handleSaveList(defaults);
        }
        setConfirmModal({ isOpen: false, type: null });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const items = Array.from(donors);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setDonors(items);
        handleSaveList(items);
    };

    const handleEditSave = (donorData: Donor) => {
        if (!donorData.name) {
            setAlert({ message: t('admin.donors.validation.name_req'), type: "error" });
            return;
        }
        if (!donorData.isPremium && !donorData.skinUrl) {
            setAlert({ message: t('admin.donors.validation.skin_req'), type: "error" });
            return;
        }
        if (!donorData.description) {
            setAlert({ message: t('admin.donors.validation.desc_req'), type: "error" });
            return;
        }

        let newList = [...donors];
        const finalDonor = {
            ...donorData,
            skinUrl: donorData.isPremium 
                ? `https://minotar.net/skin/${donorData.name}` 
                : donorData.skinUrl
        };

        if (isNew) {
            finalDonor.id = Date.now().toString();
            newList.push(finalDonor);
        } else {
            newList = newList.map(d => d.id === donorData.id ? finalDonor : d);
        }
        
        handleSaveList(newList);
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
            isPremium: false
        });
        setIsNew(true);
    };

    if (loading) return <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}><Loader /></div>;

    return (
        <div className="donor-manager-container">
            <div className="news-header">
                <div>
                   <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'1rem', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                        <div style={{ padding: '8px', background: 'rgba(var(--accent-rgb), 0.1)', borderRadius: '12px', display: 'flex', color: 'var(--accent)' }}>
                            <FaCrown />
                        </div>
                        {t('admin.donors.manager_title')}
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        {t('admin.donors.manager_desc', 'Administra la lista de honor y personaliza el perfil de cada donador.')}
                    </p>
                </div>
                <button className="btn-primary poll-new-btn" onClick={openNew}>
                    <FaPlus /> {t('admin.donors.add_btn')}
                </button>
            </div>

            <DonorsList 
                donors={donors}
                onDragEnd={onDragEnd}
                onEdit={(d) => { setEditingDonor(d); setIsNew(false); }}
                onDelete={(id) => setConfirmModal({ isOpen: true, type: 'delete', payload: id })}
                onImport={handleImportDefaults}
            />

            <DonorFormModal 
                donor={editingDonor}
                isNew={isNew}
                onClose={() => setEditingDonor(null)}
                onSave={handleEditSave}
                saving={saving}
            />

            <DonorsConfirmModal 
                isOpen={confirmModal.isOpen}
                type={confirmModal.type}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmAction}
            />

            {/* ALERT TOAST */}
            {alert && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000000, animation: 'slideUp 0.3s ease-out' }}>
                   <div style={{ 
                       background: 'rgba(0,0,0,0.8)', 
                       backdropFilter: 'blur(20px)', 
                       border: `1px solid ${alert.type === 'error' ? '#ef4444' : (alert.type === 'success' ? '#10b981' : '#facc15')}`,
                       padding: '1rem 1.5rem',
                       borderRadius: '16px',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '12px',
                       boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                   }}>
                       {alert.type === 'error' ? <FaExclamationCircle color="#ef4444" /> : <FaCheckCircle color="#10b981" />}
                       <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{alert.message}</span>
                       <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}>
                           <FaTimes />
                       </button>
                   </div>
                </div>
            )}
        </div>
    );
}
