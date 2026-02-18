import { useReducer, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Book, Edit, Save, X, Undo2 } from 'lucide-react';

import { supabase } from '../../services/supabaseClient';
import { fetchAdminDocs, updateAdminDocs, uploadAdminAsset } from '../../services/apiService';
import { ICON_MAP, AdminDoc, getDefaults } from './Docs/docsConstants';

import DocsSidebar from './Docs/DocsSidebar';
import MobileDocsDropdown from './Docs/MobileDocsDropdown';
import DocsEditor from './Docs/DocsEditor';
import DocsViewer from './Docs/DocsViewer';
import PremiumConfirm from '../UI/PremiumConfirm';
import PremiumAlert from '../UI/PremiumAlert';

interface AdminDocsState {
    activeTab: string;
    mobileMenuOpen: boolean;
    isEditing: boolean;
    editContent: string;
    isResetConfirmOpen: boolean;
    uploading: boolean;
    alertConfig: {
        isOpen: boolean;
        message: string;
        variant: 'error' | 'success';
    };
}

type AdminDocsAction = 
    | { type: 'SET_TAB'; payload: string }
    | { type: 'TOGGLE_MOBILE_MENU'; payload?: boolean }
    | { type: 'SET_EDITING'; payload: boolean }
    | { type: 'SET_EDIT_CONTENT'; payload: string }
    | { type: 'SET_RESET_CONFIRM'; payload: boolean }
    | { type: 'SET_UPLOADING'; payload: boolean }
    | { type: 'SHOW_ALERT'; payload: { message: string, variant: 'error' | 'success' } }
    | { type: 'CLOSE_ALERT' };

const initialState: AdminDocsState = {
    activeTab: 'intro',
    mobileMenuOpen: false,
    isEditing: false,
    editContent: '',
    isResetConfirmOpen: false,
    uploading: false,
    alertConfig: {
        isOpen: false,
        message: '',
        variant: 'success'
    }
};

function reducer(state: AdminDocsState, action: AdminDocsAction): AdminDocsState {
    switch (action.type) {
        case 'SET_TAB':
            return { ...state, activeTab: action.payload, isEditing: false };
        case 'TOGGLE_MOBILE_MENU':
            return { ...state, mobileMenuOpen: action.payload ?? !state.mobileMenuOpen };
        case 'SET_EDITING':
            return { ...state, isEditing: action.payload };
        case 'SET_EDIT_CONTENT':
            return { ...state, editContent: action.payload };
        case 'SET_RESET_CONFIRM':
            return { ...state, isResetConfirmOpen: action.payload };
        case 'SET_UPLOADING':
            return { ...state, uploading: action.payload };
        case 'SHOW_ALERT':
            return { 
                ...state, 
                alertConfig: { isOpen: true, message: action.payload.message, variant: action.payload.variant } 
            };
        case 'CLOSE_ALERT':
            return { ...state, alertConfig: { ...state.alertConfig, isOpen: false } };
        default:
            return state;
    }
}

export default function AdminDocs() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const defaults = getDefaults(t);
    const [state, dispatch] = useReducer(reducer, initialState);

    const { data: docs = defaults, isLoading } = useQuery<AdminDoc[]>({
        queryKey: ['admin-docs'],
        queryFn: fetchAdminDocs,
        initialData: defaults
    });

    const mutation = useMutation({
        mutationFn: ({ docs, userId, username }: { docs: AdminDoc[], userId: string, username: string }) => 
            updateAdminDocs(docs, userId, username),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-docs'] });
            dispatch({ type: 'SET_EDITING', payload: false });
        },
        onError: (err) => {
            console.error("Error saving docs:", err);
            dispatch({ 
                type: 'SHOW_ALERT', 
                payload: { message: t('admin.docs.save_error'), variant: 'error' } 
            });
        }
    });

    const activeDoc = docs.find(d => d.id === state.activeTab) || docs[0] || defaults[0];

    useEffect(() => {
        if (activeDoc) dispatch({ type: 'SET_EDIT_CONTENT', payload: activeDoc.content });
    }, [activeDoc]);

    const handleSave = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const updatedDocs = docs.map(d => 
            d.id === state.activeTab ? { ...d, content: state.editContent } : d
        );

        mutation.mutate({
            docs: updatedDocs,
            userId: session?.user?.id || '',
            username: session?.user?.user_metadata?.username || 'Admin'
        });
    };

    const handleImageUpload = async (file: File) => {
        dispatch({ type: 'SET_UPLOADING', payload: true });
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `docs/${fileName}`;

            const publicUrl = await uploadAdminAsset(file, filePath);

            const imageMarkdown = `\n![Image](${publicUrl})\n`;
            dispatch({ type: 'SET_EDIT_CONTENT', payload: state.editContent + imageMarkdown });
            
            dispatch({ 
                type: 'SHOW_ALERT', 
                payload: { 
                    message: t('admin.docs.image_uploaded', 'Imagen subida correctamente'), 
                    variant: 'success' 
                } 
            });
        } catch (err) {
            console.error("Error uploading image:", err);
            dispatch({ 
                type: 'SHOW_ALERT', 
                payload: { 
                    message: t('admin.docs.upload_error', 'Error al subir la imagen'), 
                    variant: 'error' 
                } 
            });
        } finally {
            dispatch({ type: 'SET_UPLOADING', payload: false });
        }
    };

    const executeReset = () => {
        const defaultDoc = defaults.find(d => d.id === state.activeTab);
        if (defaultDoc) dispatch({ type: 'SET_EDIT_CONTENT', payload: defaultDoc.content });
        dispatch({ type: 'SET_RESET_CONFIRM', payload: false });
    };

    if (isLoading) return <div style={{ color: '#aaa', padding: '2rem' }}>{t('admin.docs.loading')}</div>;

    const ActiveIcon = ICON_MAP[activeDoc?.id] || Book;

    return (
        <div className="admin-docs-container">
            <style>{`
                .admin-docs-container {
                    display: flex; gap: 2rem; height: calc(100vh - 150px);
                    color: #fff; position: relative;
                }
                .docs-sidebar {
                    width: 250px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.1);
                    overflow-y: auto; padding-bottom: 2rem;
                }
                .docs-content {
                    flex: 1; overflow-y: auto; padding-right: 2rem;
                    display: flex; flex-direction: column;
                }
                .docs-card {
                    background: rgba(0,0,0,0.2); padding: 2rem; border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05); flex: 1;
                    display: flex; flex-direction: column;
                }
                .sidebar-btn {
                    display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem;
                    background: transparent; color: #ccc; border: none; border-radius: 0 8px 8px 0;
                    cursor: pointer; text-align: left; width: 100%; transition: all 0.2s; font-size: 0.95rem;
                }
                .sidebar-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
                .sidebar-btn.active { background: var(--accent); color: #000; font-weight: bold; }
                .docs-editor {
                    width: 100%; min-height: 400px; background: #111; color: #eee;
                    border: 1px solid #333; border-radius: 8px; padding: 1rem;
                    font-family: monospace; font-size: 1rem; line-height: 1.5;
                    resize: vertical; outline: none;
                }
                .docs-editor:focus { border-color: var(--accent); }
                .mobile-dropdown-container { display: none; position: relative; margin-bottom: 1rem; z-index: 100; }
                .mobile-dropdown-btn {
                    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: #fff; padding: 1rem; border-radius: 8px; display: flex;
                    justify-content: space-between; align-items: center; font-weight: bold; cursor: pointer;
                }
                .mobile-dropdown-list {
                    position: absolute; top: 100%; left: 0; width: 100%; background: #1a1a1a;
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-top: 0.5rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; animation: fadeIn 0.2s ease;
                }
                .mobile-dropdown-item {
                    padding: 1rem; display: flex; align-items: center; gap: 0.8rem;
                    color: #ccc; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;
                }
                .mobile-dropdown-item.active { background: var(--accent); color: #000; }
                .docs-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 2rem; border-bottom: 1px solid var(--accent); padding-bottom: 1rem;
                }
                @media (max-width: 768px) {
                    .admin-docs-container { flex-direction: column; height: auto; gap: 1rem; overflow: visible; }
                    .docs-sidebar { display: none; }
                    .mobile-dropdown-container { display: block; }
                    .docs-content { padding-right: 0; overflow-y: visible; min-height: 500px; }
                    .docs-card { padding: 1.25rem; }
                    .docs-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .docs-header > div { width: 100%; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem; }
                    .btn-primary, .btn-secondary { flex: 1; justify-content: center; padding: 0.8rem; white-space: nowrap; }
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            <DocsSidebar 
                docs={docs} 
                activeTab={state.activeTab} 
                onTabChange={(id) => dispatch({ type: 'SET_TAB', payload: id })} 
            />

            <MobileDocsDropdown 
                docs={docs}
                activeTab={state.activeTab}
                activeTitle={activeDoc.title}
                isOpen={state.mobileMenuOpen}
                setIsOpen={(isOpen) => dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: isOpen })}
                onTabChange={(id) => dispatch({ type: 'SET_TAB', payload: id })}
            />

            <div className="docs-content">
                <div className="docs-card">
                    <div className="docs-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <ActiveIcon size={30} color="var(--accent)" />
                            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{activeDoc.title}</h2>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {state.isEditing ? (
                                <>
                                    <button onClick={() => dispatch({ type: 'SET_RESET_CONFIRM', payload: true })} className="btn-secondary" title={t('admin.docs.reset')}>
                                        <Undo2 />
                                    </button>
                                    <button onClick={() => dispatch({ type: 'SET_EDITING', payload: false })} className="btn-secondary" style={{ color: '#ef4444' }}>
                                        <X /> {t('admin.actions.cancel')}
                                    </button>
                                    <button onClick={handleSave} className="btn-primary" disabled={mutation.isPending}>
                                        <Save /> {mutation.isPending ? t('admin.docs.saving') : t('admin.actions.save')}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => dispatch({ type: 'SET_EDITING', payload: true })} className="btn-primary" style={{ background: 'rgba(22, 140, 128, 0.2)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                                    <Edit /> {t('admin.docs.edit_section')}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {state.isEditing ? (
                        <DocsEditor 
                            editContent={state.editContent}
                            setEditContent={(content) => dispatch({ type: 'SET_EDIT_CONTENT', payload: content })}
                            onUploadImage={handleImageUpload}
                            uploading={state.uploading}
                        />
                    ) : (
                        <DocsViewer content={activeDoc.content} />
                    )}
                </div>
            </div>

            <PremiumConfirm 
                isOpen={state.isResetConfirmOpen}
                title={t('admin.docs.reset_confirm_title', 'Restablecer Sección')}
                message={t('admin.docs.reset_confirm', '¿Estás seguro de que quieres restablecer esta sección a los valores predeterminados?')}
                confirmLabel={t('admin.docs.reset', 'Restablecer')}
                onConfirm={executeReset}
                onCancel={() => dispatch({ type: 'SET_RESET_CONFIRM', payload: false })}
                variant="warning"
            />
            <PremiumAlert 
                isOpen={state.alertConfig.isOpen}
                message={state.alertConfig.message}
                variant={state.alertConfig.variant}
                onClose={() => dispatch({ type: 'CLOSE_ALERT' })}
            />
        </div>
    );
}
