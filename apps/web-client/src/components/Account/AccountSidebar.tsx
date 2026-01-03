import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMedal, FaTimes, FaSignOutAlt, FaTrophy, FaServer, FaCamera, FaPen, FaComment, FaShieldAlt, FaLink, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { compressImage } from '../../utils/imageOptimizer';
import Loader from '../UI/Loader';
import { User } from '@supabase/supabase-js';

// Nav Button Component (Local)
interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const NavButton = ({ active, onClick, icon, label }: NavButtonProps) => (
    <button 
        onClick={onClick}
        className={`nav-btn ${active ? 'active' : ''}`}
    >
        <span className="nav-icon">{icon}</span>
        <span className="nav-text">{label}</span>
    </button>
)

interface AccountSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: User;
    statsData?: { username?: string };
    mcUsername: string;
    isLinked: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ 
    activeTab, 
    setActiveTab, 
    user, 
    statsData, 
    mcUsername, 
    isLinked,
    isOpen,
    onClose
}) => {
    const { t } = useTranslation();
    const { logout, updateUser } = useAuth();
    const navigate = useNavigate();
    
    // Local state for sidebar interactions
    const [uploading, setUploading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'owner';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error(t('account.avatar.error_select'));
            }

            const file = event.target.files[0];
            const compressedBlob = await compressImage(file);
            const fileExt = 'webp';
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await updateUser({ avatar_url: data.publicUrl });

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            alert(t('account.avatar.error_update') + message);
        } finally {
            setUploading(false);
        }
    };

    const handleNameUpdate = async () => {
        if (!newName.trim()) return setIsEditingName(false);
        try {
            await updateUser({ 
                full_name: newName.trim(), 
                username: newName.trim()
            });
            setIsEditingName(false);
        } catch {
            alert(t('account.name.error_update'));
        }
    };

    return (
        <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`} style={{ background: 'rgba(30,30,35,0.6)' }}>
            <div className="drawer-handle" />
            {/* Mobile Close Button */}
            <button 
                className="sidebar-close-btn-mobile"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '1.2rem',
                    display: 'none', // Shown via CSS
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <FaTimes />
            </button>

            <div className="user-snippet">
                <div className="user-avatar-premium-wrapper" style={{ position: 'relative', marginBottom: '1.2rem' }}>
                    <div className="user-avatar-large" style={{ 
                        width: '100px', 
                        height: '100px', 
                        border: '3px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.02)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                        position: 'relative',
                        zIndex: 1,
                        cursor: 'pointer',
                        margin: '0 auto',
                        borderRadius: '50%',
                        overflow: 'hidden'
                    }} onClick={handleAvatarClick}>
                        {uploading ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                                <Loader minimal />
                            </div>
                        ) : (
                            <>
                                <img 
                                    src={
                                        (user.user_metadata?.avatar_preference === 'social' && user.user_metadata?.avatar_url) 
                                            ? user.user_metadata.avatar_url 
                                            : (isLinked ? `https://mc-heads.net/avatar/${statsData?.username || mcUsername}/100` : "https://ui-avatars.com/api/?name=" + (user.user_metadata?.full_name || "User"))
                                    } 
                                    alt="Avatar" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="avatar-hover-overlay" onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}><FaCamera /></div>
                            </>
                        )}
                    </div>
                    <div className="avatar-frame-placeholder" style={{ position: 'absolute', inset: '-8px', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none', width: '116px', height: '116px', left: '50%', transform: 'translateX(-50%)' }}></div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} accept="image/*" />
                
                <div style={{ textAlign: 'center', width: '100%' }}>
                    {isEditingName ? (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '0.5rem' }}>
                            <input 
                                autoFocus 
                                value={newName} 
                                onChange={e => setNewName(e.target.value)}
                                placeholder={user.user_metadata?.full_name}
                                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '8px', width: '140px', outline: 'none' }}
                            />
                            <button onClick={handleNameUpdate} style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', cursor:'pointer', padding: '0 8px' }}>💾</button>
                        </div>
                    ) : (
                        <h3 className="user-name" style={{ color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800 }}>
                            {user.user_metadata?.full_name || mcUsername}
                            <FaPen size={12} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }} onClick={() => { setNewName(user.user_metadata?.full_name || ""); setIsEditingName(true); }} />
                        </h3>
                    )}
                    <span className="user-email" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', display: 'block', wordBreak: 'break-all' }}>{user.email}</span>
                    {isAdmin && <Link to="/admin" className="btn-small" style={{ marginTop: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(231, 76, 60, 0.1)', color: '#ff6b6b', border: '1px solid rgba(231, 76, 60, 0.2)', padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}><FaShieldAlt /> {t('account.admin_panel')}</Link>}
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FaServer />} label={t('account.nav.overview')} />
                <NavButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<FaComment />} label={t('account.nav.posts')} />
                <NavButton active={activeTab === 'medals'} onClick={() => setActiveTab('medals')} icon={<FaMedal />} label="Medallas" />
                <NavButton active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<FaTrophy />} label={t('account.nav.achievements')} />
                <NavButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} icon={<FaLink />} label={t('account.nav.connections')} />
                <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<FaCog />} label={t('account.settings.title', 'Configuración')} />
                
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
                
                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', padding: '0.8rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaSignOutAlt /> {t('account.nav.logout')}
                </button>
            </nav>
        </aside>
    );
};

export default AccountSidebar;
