import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { m, LazyMotion, domAnimation } from "framer-motion"
import { User, Home } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Loader from "../components/UI/Loader"
import ProfileWall from "../components/User/ProfileWall"
import { useAuth } from "../context/AuthContext"
import { isAdmin as checkIsAdmin } from "../utils/roleUtils"
import Toast, { ToastType } from "../components/UI/Toast"
import ProfileHeader from "../components/User/ProfileHeader"
import PlayerStatsGrid from "../components/User/PlayerStatsGrid"
import SkinShowcase from "../components/User/SkinShowcase"
import MedalList from "../components/User/MedalList"
import ProfileBio from "../components/User/ProfileBio"
import { 
    fetchUserProfile, 
    fetchMedalDefinitions, 
    fetchPlayerStats, 
    giveKarma,
    Profile
} from "../services/userService"

export default function PublicProfile() {
    const { username } = useParams<{ username: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { user: currentUser } = useAuth()
    const queryClient = useQueryClient()
    const isAdmin = checkIsAdmin(currentUser)

    const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
        visible: false,
        message: '',
        type: 'info'
    })

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ visible: true, message, type })
    }

    // Query: User Profile
    const { 
        data: profile, 
        isLoading: loadingProfile, 
        error: profileError 
    } = useQuery({
        queryKey: ['profile', username],
        queryFn: () => fetchUserProfile(username!),
        enabled: !!username,
        retry: false
    })

    // Query: Medal Definitions
    const { data: medalDefinitions = [] } = useQuery({
        queryKey: ['medalDefinitions'],
        queryFn: fetchMedalDefinitions,
        staleTime: 1000 * 60 * 30, // 30 minutes
    })

    // Query: Player Stats
    const statsIdentifier = profile?.minecraft_uuid || profile?.minecraft_nick || profile?.original_username || username;
    const { 
        data: playerStats, 
        isLoading: loadingStats 
    } = useQuery({
        queryKey: ['playerStats', statsIdentifier],
        queryFn: () => fetchPlayerStats(statsIdentifier!),
        enabled: !!profile?.public_stats && !!statsIdentifier,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Mutation: Give Karma
    const karmaMutation = useMutation({
        mutationFn: (targetId: string) => giveKarma(targetId),
        onSuccess: (data) => {
            queryClient.setQueryData(['profile', username], (old: Profile | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    reputation: data.newReputation
                };
            })
            showToast(t('profile.karma_success'), "success")
        },
        onError: (error: Error) => {
            showToast(error.message || t('profile.karma_error'), "error")
        }
    })

    const handleGiveKarma = () => {
        if (!currentUser || !profile) return
        if (currentUser.id === profile.id) return
        karmaMutation.mutate(profile.id)
    }

    const handleCopyDiscord = (discordId: string) => {
        navigator.clipboard.writeText(discordId)
        showToast(t('common.copied', 'Copiado al portapapeles'), 'success')
    }

    if (loadingProfile) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (profileError || !profile) {
        return (
            <LazyMotion features={domAnimation}>
                <div className="min-h-[80vh] flex flex-col items-center justify-center gap-8 text-center px-6">
                    <m.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)] mb-4"
                    >
                        <User size={50} className="text-red-500/80" />
                    </m.div>
                    
                    <div className="max-w-md">
                        <h2 className="text-4xl font-extrabold mb-4 bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent">
                            {t('profile.not_found_title')}
                        </h2>
                        <p className="text-white/40 text-lg leading-relaxed mb-10">
                            {t('profile.not_found_desc')}
                        </p>
                        
                        <button 
                            className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-semibold transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 active:scale-95 mx-auto"
                            onClick={() => navigate('/')}
                        >
                            <Home size={18} className="group-hover:rotate-12 transition-transform" /> 
                            {t('common.back_home')}
                        </button>
                    </div>
                </div>
            </LazyMotion>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-12 animate-in fade-in duration-700">
            {/* Premium Header */}
            <ProfileHeader 
                profile={profile} 
                currentUser={currentUser} 
                onGiveKarma={handleGiveKarma} 
                givingKarma={karmaMutation.isPending} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Stats & Skin */}
                <aside className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
                     <SkinShowcase username={profile.username} />

                    <PlayerStatsGrid 
                        stats={playerStats ?? null} 
                        loading={loadingStats} 
                        isPublic={!!profile.public_stats} 
                        isAdmin={isAdmin} 
                    />
                </aside>

                {/* Right Column: Bio, Medals & Wall */}
                <main className="lg:col-span-8 flex flex-col gap-8">
                    <ProfileBio 
                        bio={profile.bio}
                        social_discord={profile.social_discord}
                        social_twitter={profile.social_twitter}
                        social_twitch={profile.social_twitch}
                        social_youtube={profile.social_youtube}
                        onCopyDiscord={handleCopyDiscord}
                    />

                    <MedalList 
                        medals={profile.medals}
                        medalDefinitions={medalDefinitions}
                    />

                    {/* Profile Wall */}
                    <ProfileWall profileId={profile.id} isAdmin={isAdmin} />
                </main>
            </div>

            {/* Toast Notifications */}
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
            />
        </div>
    )
}
