import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface DocsEditorProps {
    editContent: string;
    setEditContent: (content: string) => void;
    onUploadImage: (file: File) => void;
    uploading: boolean;
}

const DocsEditor: React.FC<DocsEditorProps> = ({ 
    editContent, 
    setEditContent, 
    onUploadImage, 
    uploading 
}) => {
    const { t } = useTranslation();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div className="editor-toolbar" style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                padding: '0.5rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '8px' 
            }}>
                <label className="btn-icon-premium" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {uploading ? <Loader2 className="spin" /> : <ImageIcon />}
                    {uploading ? t('common.uploading', 'Subiendo...') : t('admin.docs.upload_image', 'Subir Imagen')}
                    <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        disabled={uploading}
                        onChange={(e) => {
                            if (e.target.files?.[0]) onUploadImage(e.target.files[0]);
                        }}
                    />
                </label>
            </div>
            <textarea 
                className="docs-editor"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={t('admin.docs.placeholder')}
                style={{ flex: 1 }}
            />
        </div>
    );
};

export default DocsEditor;
