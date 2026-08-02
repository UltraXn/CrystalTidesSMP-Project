import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Medal, X, LogOut, Trophy, LayoutDashboard, Camera, PenTool, MessageSquare, Shield, Link as LinkIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../services/uploadService';
import { compressImage } from '../../utils/imageOptimizer';
import Loader from '../UI/Loader';
import { User } from '@supabase/supabase-js';

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const NavButton = ({ active, onClick, icon, label }: NavButtonProps) => (
    <button aria-label="Action" 
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-colors group ${active ? 'bg-(--accent)/10 text-(--accent) shadow-lg shadow-(--accent)/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
        <span className={`text-lg transition-transform group-hover:scale-110 ${active ? 'text-(--accent)' : 'text-gray-500'}`}>{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
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
    
    const [uploading, setUploading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = ['admin', 'neroferno', 'killu', 'killuwu', 'developer', 'staff'].includes(user?.user_metadata?.role?.toLowerCase());

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
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];
            const compressedBlob = await compressImage(file);

            // Server-validated upload (backend namespaces the file under user.id)
            const publicUrl = await uploadImage(compressedBlob, 'avatars');
            await updateUser({ avatar_url: publicUrl });

        } catch (error) {
            console.error("Avatar upload error:", error);
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

    const handleNav = (tab: string) => {
        setActiveTab(tab);
        if (onClose) onClose();
    };

    return (
        <aside className={`fixed inset-y-0 left-0 w-75 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 z-200 lg:z-50 transition-transform duration-500 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:rounded-4xl lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}`}>
            
            <button aria-label="Action" type="button" 
                className="absolute top-6 right-6 lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors"
                onClick={onClose}
            >
                <X size={18} />
            </button>

            <div className="flex flex-col h-full p-8">
                {/* User Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative group/avatar mb-5 cursor-pointer" onClick={handleAvatarClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAvatarClick(); } }}>
                        <div className="relative w-24 h-24 rounded-full p-1 bg-linear-to-tr from-(--accent)/40 via-white/10 to-white/5 overflow-hidden shadow-2xl ring-2 ring-(--accent)/30 group-hover/avatar:ring-(--accent)/70 transition-colors duration-300">
                            {uploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md">
                                    <Loader minimal />
                                </div>
                            ) : (
                                <img 
                                    src={
                                        (user?.user_metadata?.avatar_preference === 'social' && user?.user_metadata?.avatar_url) 
                                            ? user.user_metadata.avatar_url 
                                            : (isLinked ? `https://mc-heads.net/avatar/${statsData?.username || mcUsername}/128` : "https://ui-avatars.com/api/?name=" + (user?.user_metadata?.full_name || "User"))
                                    } 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover/avatar:scale-105" 
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 rounded-full">
                                <Camera className="text-white text-xl" />
                            </div>
                        </div>
                        <div className="absolute -inset-2 border border-dashed border-white/10 rounded-full pointer-events-none group-hover/avatar:border-(--accent)/40 transition-colors animate-spin-slow"></div>
                    </div>
                    
                    <input aria-label="Input field" type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                    
                    <div className="space-y-1">
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input aria-label="Input field" 
                                    autoFocus 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)}
                                    className="bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-bold w-32 focus:outline-none focus:border-(--accent)/40"
                                />
                                <button aria-label="Action" type="button" onClick={handleNameUpdate} className="p-2 bg-(--accent) text-black rounded-lg text-[10px] font-black uppercase shadow-lg shadow-(--accent)/20">Save</button>
                            </div>
                        ) : (
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center justify-center gap-2 group/name">
                                {user?.user_metadata?.full_name || mcUsername}
                                <PenTool className="text-[10px] text-gray-600 group-hover/name:text-white cursor-pointer transition-colors" onClick={() => { setNewName(user?.user_metadata?.full_name || ""); setIsEditingName(true); }} />
                            </h3>
                        )}
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-45">{user?.email}</p>
                        
                        {user?.user_metadata?.status_message && (
                            <div className="mt-3 bg-white/5 border border-white/5 rounded-xl px-3.5 py-1.5 flex items-center justify-center gap-2 max-w-full backdrop-blur-md">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                <p className="text-[10px] font-bold text-gray-300 italic truncate max-w-45">
                                    "{user.user_metadata.status_message}"
                                </p>
                            </div>
                        )}

                        {/* 🪙 Compact KilluCoins (KC) Balance Pill */}
                        <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center justify-between gap-3 w-full backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <img src="/images/killucoin.png" alt="KC" className="w-4 h-4 object-contain [image-rendering:pixelated]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                KilluCoins
                            </span>
                            <span className="font-mono text-xs font-black text-amber-300">
                                {(user?.user_metadata?.gacha_balance ?? 0).toLocaleString()} KC
                            </span>
                        </div>
                    </div>

                    {isAdmin && (
                        <Link to="/admin" className="mt-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 active:scale-95 transition-colors shadow-lg shadow-red-500/5">
                            <Shield size={14} /> {t('account.admin_panel')}
                        </Link>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-24 lg:pb-0">
                    <NavButton active={activeTab === 'overview'} onClick={() => handleNav('overview')} icon={<LayoutDashboard size={18} />} label={t('account.nav.overview')} />
                    <NavButton active={activeTab === 'posts'} onClick={() => handleNav('posts')} icon={<MessageSquare size={18} />} label={t('account.nav.posts')} />
                    <NavButton active={activeTab === 'medals'} onClick={() => handleNav('medals')} icon={<Medal size={18} />} label={t('account.nav.medals', 'Medallas')} />
                    <NavButton active={activeTab === 'achievements'} onClick={() => handleNav('achievements')} icon={<Trophy size={18} />} label={t('account.nav.achievements')} />
                    <NavButton active={activeTab === 'connections'} onClick={() => handleNav('connections')} icon={<LinkIcon size={18} />} label={t('account.nav.connections')} />
                    <NavButton active={activeTab === 'settings'} onClick={() => handleNav('settings')} icon={<Settings size={18} />} label={t('account.nav.settings', 'Configuración')} />
                </nav>

                <div className="pt-5 mt-4 border-t border-white/5">
                    <button type="button" 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 active:scale-95 transition-colors font-black uppercase tracking-widest text-[10px]"
                    >
                        <LogOut size={16} /> {t('account.nav.logout')}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AccountSidebar;
