import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { FaUser, FaCamera, FaShieldAlt, FaDiscord, FaTwitter, FaTwitch } from 'react-icons/fa';
import { SiKofi } from 'react-icons/si';
import { User, UserIdentity } from '@supabase/supabase-js';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import Loader from '../UI/Loader';
import TwoFactorSetup from '../Profile/Security/TwoFactorSetup';
import { updateUserSchema, UpdateUserFormValues } from '../../schemas/user';

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
    const { updateUser } = useAuth();

    // Local state
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [publicStats, setPublicStats] = useState(user?.user_metadata?.public_stats !== false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Form Setup
    const { register, handleSubmit, setValue, watch } = useForm<UpdateUserFormValues>({
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

    // Auto-fill social links from connected identities
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

    // Handlers
    const handleUpdatePassword = async () => {
        if(passwords.new !== passwords.confirm) return showToast("Las contraseñas no coinciden", "error")
        if(passwords.new.length < 6) return showToast("Mínimo 6 caracteres", "error")
        setIsUpdatingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new })
            if(error) throw error
            showToast(t('account.settings.success_password', '¡Contraseña actualizada!'), 'success')
            setPasswords({ new: '', confirm: '' })
        } catch(e) {
            const message = e instanceof Error ? e.message : String(e);
            showToast("Error: " + message, "error")
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    const handlePrivacyToggle = async () => {
         const newVal = !publicStats
         setPublicStats(newVal)
         await updateUser({ public_stats: newVal })
    }

    const handleSaveProfile = async (data: UpdateUserFormValues) => {
        setIsSavingProfile(true)
        try {
            await updateUser(data)
            showToast("Perfil actualizado correctamente", "success")
        } catch (e) {
            console.error(e)
            showToast("Error al guardar el perfil", "error")
        } finally {
            setIsSavingProfile(false)
        }
    }

    return (
        <div key="settings" className="fade-in">
            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.settings.title', 'Configuración')}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Profile Info Card */}
                <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', gridColumn: '1 / -1' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'10px' }}><FaUser /> Información del Perfil</h3>

                    {/* Avatar Preference Selector */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Preferencia de Avatar
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div 
                                onClick={() => setValue('avatar_preference', 'minecraft')}
                                style={{ 
                                    padding: '1rem', 
                                    borderRadius: '10px', 
                                    border: `2px solid ${watch('avatar_preference') === 'minecraft' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                                    background: watch('avatar_preference') === 'minecraft' ? 'rgba(109, 165, 192, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    transition: '0.2s'
                                }}
                            >
                                <img src={`https://mc-heads.net/avatar/${mcUsername}/48`} alt="MC" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                <span style={{ fontSize: '0.85rem', color: watch('avatar_preference') === 'minecraft' ? '#fff' : '#888', fontWeight: '600' }}>Minecraft Head</span>
                            </div>

                            <div 
                                onClick={() => setValue('avatar_preference', 'social')}
                                style={{ 
                                    padding: '1rem', 
                                    borderRadius: '10px', 
                                    border: `2px solid ${watch('avatar_preference') === 'social' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                                    background: watch('avatar_preference') === 'social' ? 'rgba(109, 165, 192, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    transition: '0.2s'
                                }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                                    <img 
                                        src={user?.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user?.user_metadata?.full_name || "User")} 
                                        alt="Social" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                                <span style={{ fontSize: '0.85rem', color: watch('avatar_preference') === 'social' ? '#fff' : '#888', fontWeight: '600' }}>Social / Web</span>
                            </div>
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                            * Selecciona qué imagen prefieres ver en tu perfil público y barra de navegación.
                        </p>
                    </div>

                    {/* Profile Banner */}
                    <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', marginBottom: '1.2rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {t('account.settings.banner', 'Banner del Perfil')}
                        </label>
                        
                        <div style={{ 
                            width: '100%', 
                            height: '200px', 
                            borderRadius: '20px', 
                            overflow: 'hidden', 
                            background: '#111',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {watch('profile_banner_url') ? (
                                <>
                                    <img src={watch('profile_banner_url')} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                                </>
                            ) : (
                                <div style={{ color: '#444', textAlign: 'center' }}>
                                    <FaCamera size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p style={{ fontSize: '0.9rem' }}>Sin Banner</p>
                                </div>
                            )}
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '1rem', 
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <input 
                                    {...register('profile_banner_url')}
                                    placeholder="URL de la imagen (ej: https://imgur.com/...)"
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px 16px', 
                                        borderRadius: '12px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        background: 'rgba(0,0,0,0.2)', 
                                        color: '#fff',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>
                        <p style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: '#666', paddingLeft: '0.5rem' }}>
                            {t('account.settings.banner_hint', 'Introduce una URL de imagen (Imgur, Discord, etc). Recomendado: 1200x400px.')}
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit(handleSaveProfile)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Biografía (Markdown opcional)</label>
                            <textarea 
                                {...register('bio')}
                                rows={4}
                                maxLength={500}
                                placeholder="Cuéntanos un poco sobre ti..."
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    background: 'rgba(0,0,0,0.3)', 
                                    color: '#fff', 
                                    resize: 'vertical',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6'
                                }}
                            />
                            <span style={{ fontSize: '0.7rem', color: '#555', marginTop: '8px', display: 'block', textAlign: 'right', fontWeight: 600 }}>MAX 500 CHARS</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '-0.5rem' }}>Redes Sociales</label>
                            
                            {/* Discord Input Group */}
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 16px', transition: '0.2s' }}>
                                <FaDiscord style={{ color: '#5865F2', fontSize: '1.2rem', minWidth: '24px' }} />
                                <input 
                                    {...register('social_discord')}
                                    placeholder="Usuario#0000"
                                    style={{ flex: 1, padding: '14px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>

                            {/* Twitter Input Group */}
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 16px', transition: '0.2s' }}>
                                <FaTwitter style={{ color: '#1da1f2', fontSize: '1.2rem', minWidth: '24px' }} />
                                <input 
                                    {...register('social_twitter')}
                                    placeholder="Twitter (ej: @miusuario)"
                                    style={{ flex: 1, padding: '14px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>

                            {/* Twitch Input Group */}
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 16px', transition: '0.2s' }}>
                                <FaTwitch style={{ color: '#9146FF', fontSize: '1.2rem', minWidth: '24px' }} />
                                <input 
                                    {...register('social_twitch')}
                                    placeholder="Canal de Twitch"
                                    style={{ flex: 1, padding: '14px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>

                            {/* Ko-Fi Input Group */}
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 16px', transition: '0.2s' }}>
                                <SiKofi style={{ color: '#00AF96', fontSize: '1.2rem', minWidth: '24px' }} />
                                <input 
                                    {...register('social_kofi')}
                                    placeholder="URL de Ko-Fi"
                                    style={{ flex: 1, padding: '14px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={isSavingProfile}
                                className="btn-primary"
                                style={{ 
                                    marginTop: '1.5rem', 
                                    padding: '14px', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    borderRadius: '14px',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 8px 20px rgba(109, 165, 192, 0.2)'
                                }}
                            >
                                {isSavingProfile ? <Loader minimal /> : <><FaUser /> {t('account.settings.save_info', 'Actualizar Perfil')}</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Privacy Card */}
                <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'10px' }}><FaShieldAlt /> {t('account.settings.privacy', 'Privacidad')}</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#fff', margin: 0 }}>{t('account.settings.public_stats', 'Mostrar estadísticas públicas')}</p>
                            <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>{t('account.settings.public_stats_desc', 'Otros usuarios podrán ver tu perfil.')}</p>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', flexShrink: 0 }}>
                            <input type="checkbox" checked={publicStats} onChange={handlePrivacyToggle} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: publicStats ? 'var(--accent)' : '#ccc', transition: '.4s', borderRadius: '34px' }}>
                                <span style={{ position: 'absolute', height: '18px', width: '18px', left: publicStats ? '28px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Security Card */}
                <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'10px' }}><FaUser /> {t('account.settings.security', 'Seguridad')}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('account.settings.new_password', 'Nueva Contraseña')}</label>
                            <input 
                                type="password" 
                                value={passwords.new}
                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('account.settings.confirm_password', 'Confirmar Contraseña')}</label>
                            <input 
                                type="password" 
                                value={passwords.confirm}
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }}
                            />
                        </div>
                        <button 
                            onClick={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                padding: '12px', 
                                borderRadius: '12px', 
                                color: '#fff', 
                                fontWeight: 'bold', 
                                cursor: 'pointer', 
                                marginTop: '0.5rem', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                transition: '0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            {isUpdatingPassword ? <Loader minimal /> : t('account.settings.update_password', 'Actualizar Contraseña')}
                        </button>
                    </div>
                </div>
                <TwoFactorSetup />
            </div>
        </div>
    );
};

export default ProfileSettings;
