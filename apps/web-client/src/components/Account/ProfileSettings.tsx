import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Camera, Shield, Twitter, Link, Lock, FileCode } from 'lucide-react';
import { User, UserIdentity } from '@supabase/supabase-js';

import Loader from '../UI/Loader';
import TwoFactorSetup from '../Profile/Security/TwoFactorSetup';
import { updateUserSchema, UpdateUserFormValues } from '../../schemas/user';
import { useUpdateProfile, useUpdatePassword } from '../../hooks/useAccountData';

interface ProfileSettingsProps {
    user: User;
    mcUsername: string;
    discordIdentity?: UserIdentity;
    twitchIdentity?: UserIdentity;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
    user, 
    mcUsername, 
    discordIdentity, 
    twitchIdentity,
    showToast 
}) => {
    const { t } = useTranslation();
    
    // Mutations (TanStack Query)
    const { mutate: updateProfile, isPending: isSavingProfile } = useUpdateProfile();
    const { mutate: changePassword, isPending: isUpdatingPassword } = useUpdatePassword();

    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [publicStats, setPublicStats] = useState(user?.user_metadata?.public_stats !== false);

    const { register, handleSubmit, setValue, control } = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            bio: user?.user_metadata?.bio || "",
            social_discord: user?.user_metadata?.social_discord || "",
            social_twitter: user?.user_metadata?.social_twitter || "",
            social_twitch: user?.user_metadata?.social_twitch || "",
            social_youtube: user?.user_metadata?.social_youtube || "",
            social_kofi: user?.user_metadata?.social_kofi || "",
            avatar_preference: user?.user_metadata?.avatar_preference || "minecraft",
            profile_banner_url: user?.user_metadata?.profile_banner_url || ""
        }
    });

    const avatarPreference = useWatch({ control, name: 'avatar_preference' });
    const bannerUrl = useWatch({ control, name: 'profile_banner_url' });
    const bioValue = useWatch({ control, name: 'bio' });

    useEffect(() => {
        if (!user) return;
        
        if (discordIdentity) {
            const name = discordIdentity.identity_data?.full_name || discordIdentity.identity_data?.name || discordIdentity.identity_data?.user_name;
            if (name && !user.user_metadata?.social_discord) {
                setValue('social_discord', name)
            }
        }

        if (twitchIdentity) {
            const name = twitchIdentity.identity_data?.name || twitchIdentity.identity_data?.login;
            if (name && !user.user_metadata?.social_twitch) {
                 setValue('social_twitch', `https://twitch.tv/${name}`)
            }
        }
    }, [discordIdentity, twitchIdentity, user, setValue]);

    const handleUpdatePassword = () => {
        if(passwords.new !== passwords.confirm) return showToast("Las contraseñas no coinciden", "error")
        if(passwords.new.length < 6) return showToast("Mínimo 6 caracteres", "error")
        
        changePassword(passwords.new, {
            onSuccess: () => {
                showToast(t('account.settings.success_password', '¡Contraseña actualizada!'), 'success');
                setPasswords({ new: '', confirm: '' });
            },
            onError: (err: Error) => {
                showToast("Error: " + err.message, "error");
            }
        });
    };

    const handlePrivacyToggle = () => {
         const newVal = !publicStats;
         setPublicStats(newVal);
         updateProfile({ public_stats: newVal }, {
             onError: () => {
                 setPublicStats(!newVal); // Rollback on error
                 showToast("Error al actualizar privacidad", "error");
             }
         });
    };

    const handleSaveProfile = (data: UpdateUserFormValues) => {
        updateProfile(data as Record<string, unknown>, {
            onSuccess: () => {
                showToast("Perfil actualizado correctamente", "success");
            },
            onError: () => {
                showToast("Error al guardar el perfil", "error");
            }
        });
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 border-b border-white/5 pb-4">
                {t('account.settings.title', 'Configuración')}
            </h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Profile Header Settings */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* Avatar Preference */}
                    <div className="bg-white/2 border border-white/5 rounded-4xl p-8 space-y-6">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                            {t('account.settings.avatar_pref', 'Preferencia de Avatar')}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                                onClick={() => setValue('avatar_preference', 'minecraft')}
                                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${avatarPreference === 'minecraft' ? 'bg-(--accent)/10 border-(--accent)/40 shadow-lg shadow-(--accent)/5' : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                            >
                                <img src={`https://mc-heads.net/avatar/${mcUsername}/64`} alt="MC" className="w-12 h-12 rounded-xl object-contain [image-rendering:pixelated]" />
                                <div className="text-left">
                                    <span className={`block text-xs font-black uppercase tracking-widest ${avatarPreference === 'minecraft' ? 'text-(--accent)' : 'text-gray-400'}`}>{t('account.settings.mc_head', 'Minecraft Head')}</span>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase">{mcUsername}</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => setValue('avatar_preference', 'social')}
                                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${avatarPreference === 'social' ? 'bg-(--accent)/10 border-(--accent)/40 shadow-lg shadow-(--accent)/5' : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                            >
                                <img 
                                    src={user?.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user?.user_metadata?.full_name || "User")} 
                                    alt="Social" 
                                    className="w-12 h-12 rounded-xl object-cover" 
                                />
                                <div className="text-left">
                                    <span className={`block text-xs font-black uppercase tracking-widest ${avatarPreference === 'social' ? 'text-(--accent)' : 'text-gray-400'}`}>{t('account.settings.social_web', 'Social / Web')}</span>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase truncate max-w-[120px]">{user?.user_metadata?.full_name}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Profile Banner */}
                    <div className="bg-white/2 border border-white/5 rounded-4xl p-8 space-y-6">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                            {t('account.settings.banner', 'Banner del Perfil')}
                        </label>
                        
                        <div className="relative w-full h-48 rounded-3xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center group/banner">
                            {bannerUrl ? (
                                <>
                                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-gray-700">
                                    <Camera className="text-4xl opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('account.settings.no_banner', 'Sin Banner')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <div className="relative flex-1 group/input">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-500 group-hover/input:text-(--accent) transition-colors">
                                    <Link className="text-xs" />
                                </div>
                                <input 
                                    {...register('profile_banner_url')}
                                    placeholder={t('account.settings.banner_placeholder', 'URL de la imagen (ej: https://imgur.com/...)')}
                                    className="w-full bg-white/2 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white placeholder:text-gray-700 focus:outline-none focus:border-(--accent)/40 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings (Left Column) */}
                <div className="space-y-8">
                    {/* Privacy */}
                    <div className="bg-white/2 border border-white/5 rounded-4xl p-8 space-y-6">
                        <div className="flex items-center gap-4 text-(--accent)">
                            <Shield className="text-xl" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t('account.settings.privacy', 'Privacidad')}</h3>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 gap-4">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-white uppercase tracking-widest">{t('account.settings.public_stats', 'Público')}</p>
                                <p className="text-[10px] text-gray-600 font-bold leading-tight">{t('account.settings.public_stats_desc', 'Estadísticas visibles.')}</p>
                            </div>
                            <button 
                                onClick={handlePrivacyToggle}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 ${publicStats ? 'bg-linear-to-r from-(--accent) to-(--accent)/80 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'bg-black/50 border border-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${publicStats ? 'left-8' : 'left-1 opacity-50'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Social Links Section (Moved Here) */}
                    <div className="bg-white/2 border border-white/5 rounded-4xl p-8 space-y-6">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                            {t('account.settings.social_links', 'Redes Sociales')}
                        </label>
                        
                        <div className="space-y-4">
                            {[
                                { id: 'social_discord', icon: (props: React.SVGProps<SVGSVGElement>) => (
                                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                    </svg>
                                ), color: '#5865F2', label: 'Discord' },
                                { id: 'social_twitter', icon: Twitter, color: '#1da1f2', label: 'Twitter' },
                                { id: 'social_twitch', icon: (props: React.SVGProps<SVGSVGElement>) => (
                                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                    </svg>
                                ), color: '#9146FF', label: 'Twitch' },
                                { id: 'social_kofi', icon: (props: React.SVGProps<SVGSVGElement>) => (
                                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                                        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.724c-.304 0-.553.243-.553.543v10.812c0 .301.249.544.553.544H10.741c1.389 0 2.496 1.311 2.496 2.679 0 1.367-1.106 2.476-2.496 2.476H3.857c-.301 0-.544.25-.544.553v.681c0 .302.243.553.544.553h6.884c3.285 0 5.619-2.633 5.619-5.65v-.601c0-.446.365-.806.811-.806h.452c3.035 0 6.223-1.647 6.223-6.155a5.807 5.807 0 00-.165-1.545zM19.141 12.18h-.129l-.292.011c-.139 0-.251-.112-.251-.251V5.556c0-.421.314-.735.735-.735a4.484 4.484 0 01 2.399.641c.421.28.665.735.665 1.201.011 3.265-2.036 5.516-3.127 5.516z"/><path d="M9.133 9.133s-.309-1.233-1.543-1.233c-1.232 0-1.542 1.233-1.542 1.233s-.31 1.234.617 1.234H8.514c.928.001.619-1.234.619-1.234z"/>
                                    </svg>
                                ), color: '#00AF96', label: 'Ko-Fi' }
                            ].map((item) => (
                                <div key={item.id} className="relative group/social">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within/social:scale-110 transition-transform" style={{ color: item.color }}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <input 
                                        {...register(item.id as keyof UpdateUserFormValues & string)}
                                        autoComplete="off"
                                        placeholder={item.label}
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Profile Form & Security */}
                <div className="xl:col-span-3">
                    <form onSubmit={handleSubmit(handleSaveProfile)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bio Section */}
                        <div className="bg-white/2 border border-white/5 rounded-4xl p-8 space-y-6 lg:row-span-2 flex flex-col h-full">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                                {t('account.settings.bio_label', 'Biografía')}
                            </label>
                            <div className="relative flex-1">
                                <textarea 
                                    {...register('bio')}
                                    rows={10}
                                    maxLength={500}
                                    placeholder={t('account.settings.bio_ph', 'Cuenta tu historia...')}
                                    className="w-full h-full min-h-[200px] bg-black/20 border border-white/5 rounded-3xl p-6 text-sm font-medium leading-relaxed text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-(--accent)/40 transition-all resize-none scrollbar-thin scrollbar-thumb-white/5"
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-black text-gray-700 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                                    {bioValue?.length || 0}/500
                                </div>
                            </div>
                            <a 
                                href="https://www.markdownguide.org/cheat-sheet/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 px-2 hover:text-(--accent) transition-colors cursor-help"
                                title="**Negrita**, *Cursiva*, [Enlace](url), > Cita"
                            >
                                <FileCode className="text-lg opacity-50" />
                                <span>{t('account.settings.markdown_support', 'Soporte Markdown')}</span>
                            </a>
                        </div>

                        {/* Security Section (Right Column) */}
                        <div className="flex flex-col gap-8 h-full">
                             {/* Password Change */}
                            <div className="bg-white/2 border border-white/5 rounded-4xl p-8 space-y-6">
                                <div className="flex items-center gap-4 text-red-400">
                                    <Lock className="text-xl" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t('account.settings.security', 'Seguridad')}</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">{t('account.settings.new_password', 'Nueva Contraseña')}</label>
                                        <input 
                                            type="password" 
                                            value={passwords.new}
                                            onChange={e => setPasswords({...passwords, new: e.target.value})}
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-red-500/30 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">{t('account.settings.confirm_password', 'Confirmar')}</label>
                                        <input 
                                            type="password" 
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-red-500/30 transition-all font-mono"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleUpdatePassword}
                                        disabled={isUpdatingPassword}
                                        className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all disabled:opacity-30"
                                    >
                                        {isUpdatingPassword ? <Loader minimal /> : t('account.settings.update_password', 'Actualizar Password')}
                                    </button>
                                </div>
                            </div>
                            
                            <TwoFactorSetup />

                            {/* Save Button */}
                            <div className="mt-auto pt-4">
                                <button 
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="w-full py-5 bg-linear-to-r from-(--accent) to-(--accent)/80 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-(--accent)/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 border border-white/10"
                                >
                                    {isSavingProfile ? <Loader minimal /> : <><UserIcon className="text-lg" /> {t('account.settings.save_profile', 'Actualizar Perfil')}</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
