import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Send, BarChart2, CheckCircle, AlertTriangle, Loader2, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSuggestionSchema, CreateSuggestionFormValues } from '../schemas/suggestion'
import { gsap } from "gsap"

interface PollOption {
    id: number;
    label: string;
    votes: number;
    percent: number;
}

interface Poll {
    id: number;
    title: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    closesIn: string;
}

interface SuggestionItem {
    id: string | number;
    nickname: string;
    type: string;
    message: string;
    created_at: string;
    upvotes: number;
    downvotes: number;
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Seed Suggestions in case database is empty or offline
const SEED_SUGGESTIONS: SuggestionItem[] = [
    {
        id: 'seed-1',
        nickname: 'pixiesixer',
        type: 'General',
        message: 'Sería genial tener un mercado de agricultores en el spawn los domingos donde podamos vender cultivos por CrystalCoins.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        upvotes: 34,
        downvotes: 3
    },
    {
        id: 'seed-2',
        nickname: 'Zeta',
        type: 'Mod',
        message: 'Propongo agregar el mod de decoración "Supplementaries" para darle más vida a nuestras construcciones medievales.',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        upvotes: 56,
        downvotes: 4
    },
    {
        id: 'seed-3',
        nickname: 'Neroferno',
        type: 'Bug',
        message: 'El comando /spawn a veces te teletransporta un bloque por debajo del suelo y sufres daño por sofocación.',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        upvotes: 18,
        downvotes: 1
    }
];

let tempIdCounter = 0;

export default function Suggestions() {
    const { t } = useTranslation()
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    // Form Hook
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<CreateSuggestionFormValues>({
        resolver: zodResolver(createSuggestionSchema),
        defaultValues: {
            nickname: '',
            type: 'General',
            message: ''
        }
    })

    // Watch nickname for real-time head preview
    const watchNickname = useWatch({
        control,
        name: 'nickname',
        defaultValue: ''
    })


    // Poll State
    const [voted, setVoted] = useState(false)
    const queryClient = useQueryClient()

    // Suggestions Wall State — local overrides for optimistic UI
    const [suggestionsOverride, setSuggestionsOverride] = useState<SuggestionItem[] | null>(null)
    const [votedSuggestions, setVotedSuggestions] = useState<Record<string | number, 'up' | 'down'>>({})

    // Fetch Poll via useQuery
    const { data: pollData, isLoading: loadingPoll } = useQuery({
        queryKey: ['activePoll'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/polls/active`)
            if (!res.ok) return null
            const data = await res.json()
            return data?.success ? data.data as Poll : null
        },
        staleTime: 30_000,
    })
    const poll = pollData ?? null

    // Fetch Suggestions via useQuery
    const { data: suggestionsFromQuery = SEED_SUGGESTIONS } = useQuery<SuggestionItem[]>({
        queryKey: ['suggestions'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/suggestions`)
            if (!res.ok) return SEED_SUGGESTIONS
            const data = await res.json()
            return Array.isArray(data) && data.length > 0 ? data : SEED_SUGGESTIONS
        },
        staleTime: 30_000,
    })
    const suggestions = suggestionsOverride ?? suggestionsFromQuery

    // Entrance animation only
    useEffect(() => {
        gsap.fromTo('.suggestion-column, .polls-column',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" }
        );
    }, [])

    const handleVote = async (optionId: number) => {
        if(voted || !poll) return
        
        try {
            const res = await fetch(`${API_URL}/polls/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pollId: poll.id, optionId })
            })
            
            if (res.ok) {
                setVoted(true)
                queryClient.invalidateQueries({ queryKey: ['activePoll'] })
            }
        } catch(err) {
            console.error(err)
        }
    }

    const [validationError, setValidationError] = useState<string | null>(null)
    const [rewardSuccessMsg, setRewardSuccessMsg] = useState<string | null>(null)

    const onSubmit = async (data: CreateSuggestionFormValues) => {
        setFormStatus('sending')
        setValidationError(null)
        setRewardSuccessMsg(null)

        try {
            const res = await fetch(`${API_URL}/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            
            const json = await res.json()

            if (res.ok && !json.error) {
                setFormStatus('success')
                setRewardSuccessMsg(json.kc_awarded ? `🤖 ¡Propuesta validada por la IA! Recompensado con +${json.kc_awarded} KilluCoins 🎉` : '¡Sugerencia enviada con éxito!')
                
                const newSuggestion: SuggestionItem = {
                    id: json.id || `temp-${++tempIdCounter}`,
                    nickname: data.nickname || 'Anónimo',
                    type: data.type,
                    message: data.message,
                    created_at: new Date().toISOString(),
                    upvotes: 1,
                    downvotes: 0
                }
                setSuggestionsOverride(prev => [newSuggestion, ...(prev ?? suggestions)])
                reset()
            } else {
                setFormStatus('error')
                setValidationError(json.error || 'No se pudo enviar la sugerencia.')
            }
        } catch {
             setFormStatus('error')
             setValidationError('Error de conexión al servidor.')
        }
    }

    const handleVoteSuggestion = (id: string | number, direction: 'up' | 'down') => {
        const currentVote = votedSuggestions[id]
        if (currentVote === direction) return // Already voted

        setSuggestionsOverride(prev => (prev ?? suggestions).map(s => {
            if (s.id === id) {
                let ups = s.upvotes
                let downs = s.downvotes
                if (direction === 'up') {
                    ups += 1
                    if (currentVote === 'down') downs -= 1
                } else {
                    downs += 1
                    if (currentVote === 'up') ups -= 1
                }
                return { ...s, upvotes: ups, downvotes: downs }
            }
            return s
        }))

        setVotedSuggestions(prev => ({ ...prev, [id]: direction }))
    }

    return (
        <Section title={t('suggestions.title')}>
            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-350 mx-auto px-4">

                    {/* IZQUIERDA: FORMULARIO Y MURO (3/5) */}
                    <div className="lg:col-span-3 flex flex-col gap-12 suggestion-column">
                        
                        {/* FORMULARIO */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) text-xl border border-(--accent)/20">
                                    <Send />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {t('suggestions.form_title')}
                                </h3>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                                {formStatus === 'success' ? (
                                    <div className="text-center py-10">
                                        <CheckCircle size={60} className="text-emerald-400 mx-auto mb-6 animate-bounce" />
                                        <h4 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">{t('suggestions.form.received')}</h4>
                                        <p className="text-gray-400 font-medium leading-relaxed max-w-md mx-auto mb-8">{t('suggestions.form.success_msg')}</p>
                                        <button type="button" 
                                            onClick={() => setFormStatus('idle')} 
                                            className="px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm transition-colors hover:bg-(--accent) hover:scale-105 active:scale-95 shadow-xl"
                                        >
                                            {t('suggestions.form.send_another')}
                                        </button>
                                    </div>
                                ) : (
                                    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            
                                            {/* Nickname Input with Live Avatar Preview */}
                                            <div className="flex items-center gap-4 bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-(--accent) transition-colors">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                    {watchNickname && watchNickname.length >= 3 ? (
                                                        <img 
                                                            src={`https://mc-heads.net/avatar/${watchNickname}/64`} 
                                                            alt={watchNickname} 
                                                            className="w-10 h-10 object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steeve/64';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="text-white/25 font-black text-lg">?</div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col grow">
                                                    <label htmlFor="suggestion-nickname" className="text-[9px] font-black uppercase tracking-widest text-gray-500">{t('suggestions.form.nick')}</label>
                                                    <input
                                                        id="suggestion-nickname"
                                                        type="text" 
                                                        className="bg-transparent text-white focus:outline-none text-sm font-bold w-full mt-0.5 placeholder:text-white/20" 
                                                        placeholder={t('suggestions.form.nick_placeholder')} 
                                                        {...register('nickname')}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label htmlFor="suggestion-type" className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-4 mb-1">{t('suggestions.form.type')}</label>
                                                <select
                                                    id="suggestion-type" 
                                                    className="bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-(--accent) transition-colors appearance-none cursor-pointer text-sm font-bold h-full" 
                                                    {...register('type')}
                                                >
                                                    <option value="General" className="bg-[#0a0a0a]">{t('suggestions.form.options.general')}</option>
                                                    <option value="Bug" className="bg-[#0a0a0a]">{t('suggestions.form.options.bug')}</option>
                                                    <option value="Mod" className="bg-[#0a0a0a]">{t('suggestions.form.options.mod')}</option>
                                                    <option value="Complaint" className="bg-[#0a0a0a]">{t('suggestions.form.options.complaint')}</option>
                                                    <option value="Poll" className="bg-[#0a0a0a]">{t('suggestions.form.options.poll')}</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        {errors.nickname && <span className="text-red-500 text-[10px] font-bold uppercase ml-4 -mt-3">{errors.nickname.message}</span>}

                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="suggestion-message" className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('suggestions.form.msg')}</label>
                                            <textarea
                                                id="suggestion-message" 
                                                className="bg-black/20 border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-(--accent) transition-colors placeholder:text-white/10 min-h-37.5 resize-none text-sm font-medium leading-relaxed" 
                                                placeholder={t('suggestions.form.msg_placeholder')} 
                                                {...register('message')}
                                            ></textarea>
                                            {errors.message && <span className="text-red-500 text-[10px] font-bold uppercase ml-4">{errors.message.message}</span>}
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            className="bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest mt-2 transition-colors hover:bg-(--accent) hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50" 
                                            disabled={isSubmitting || formStatus === 'sending'}
                                        >
                                            {isSubmitting || formStatus === 'sending' ? (
                                                <span className="flex items-center justify-center gap-3">
                                                    <Loader2 className="animate-spin" /> Validando propuesta por IA...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-3">
                                                    <Send className="text-xs" /> {t('suggestions.form.submit')}
                                                </span>
                                            )}
                                        </button>

                                        {rewardSuccessMsg && (
                                            <p className="text-emerald-400 text-center font-black uppercase tracking-wider text-xs mt-4 bg-emerald-500/10 border border-emerald-500/20 py-3 px-4 rounded-xl">
                                                {rewardSuccessMsg}
                                            </p>
                                        )}

                                        {formStatus === 'error' && (
                                            <p className="text-red-400 text-center font-bold uppercase tracking-wider text-xs mt-4 bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl">
                                                {validationError || t('suggestions.form.error_msg')}
                                            </p>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* MURO DE SUGERENCIAS */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) text-xl border border-(--accent)/20">
                                    <MessageSquare />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    Sugerencias Recientes
                                </h3>
                            </div>

                            <div className="flex flex-col gap-6 max-h-137.5 overflow-y-auto pr-2 custom-scrollbar">
                                {suggestions.map((item) => (
                                    <div key={item.id} className="group bg-black/30 border border-white/5 rounded-3xl p-6 flex flex-col gap-4 transition-colors duration-300 hover:bg-white/5 hover:border-white/10">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={`https://mc-heads.net/avatar/${item.nickname}/64`}
                                                    alt={item.nickname}
                                                    className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steeve/64';
                                                    }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white">{item.nickname}</span>
                                                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-(--accent)">
                                                {item.type}
                                            </span>
                                        </div>

                                        <p className="text-gray-300 text-sm leading-relaxed font-medium italic">
                                            "{item.message}"
                                        </p>

                                        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                                            <button aria-label="Action" type="button" 
                                                onClick={() => handleVoteSuggestion(item.id, 'up')}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors active:scale-90 ${votedSuggestions[item.id] === 'up' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
                                            >
                                                <ThumbsUp size={12} />
                                                <span>{item.upvotes}</span>
                                            </button>
                                            <button aria-label="Action" type="button" 
                                                onClick={() => handleVoteSuggestion(item.id, 'down')}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors active:scale-90 ${votedSuggestions[item.id] === 'down' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
                                            >
                                                <ThumbsDown size={12} />
                                                <span>{item.downvotes}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* DERECHA: VOTACIONES (2/5) */}
                    <div className="lg:col-span-2 polls-column">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) text-xl border border-(--accent)/20">
                                <BarChart2 />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {t('suggestions.poll_title')}
                            </h3>
                        </div>

                        {loadingPoll && (
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-white/20" size={32} />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('suggestions.loading_poll')}</p>
                            </div>
                        )}

                        {!loadingPoll && !poll && (
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 text-center opacity-50">
                                <AlertTriangle size={48} className="text-white/10" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-50 leading-relaxed">{t('suggestions.no_active_poll')}</p>
                            </div>
                        )}

                        {!loadingPoll && poll && (
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl flex flex-col gap-8">
                                <div>
                                    <div className="text-(--accent) text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-(--accent) animate-pulse"></span>
                                        {poll.title}
                                    </div>
                                    <h4 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
                                        {poll.question}
                                    </h4>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {(poll.options || []).map((option: PollOption) => (
                                        <button 
                                            key={option.id} 
                                            type="button"
                                            disabled={voted}
                                            className={`relative group h-14 bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-colors w-full text-left ${voted ? 'cursor-default' : 'cursor-pointer hover:bg-white/10 hover:border-white/20 active:scale-95'}`} 
                                            onClick={() => handleVote(option.id)}
                                        >
                                            {/* Liquid Gradient Bar Fill */}
                                            <div 
                                                className={`absolute left-0 inset-y-0 transition-colors duration-1000 ease-out bg-linear-to-r from-cyan-500/35 via-blue-500/25 to-indigo-500/35`} 
                                                style={{ width: voted ? `${option.percent}%` : '0%' }}
                                            >
                                                {/* Glowing edge tip */}
                                                {voted && option.percent > 0 && (
                                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] rounded-full"></div>
                                                )}
                                            </div>
                                            
                                            <div className="relative z-10 h-full flex items-center justify-between px-6 pointer-events-none">
                                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${voted ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{option.label}</span>
                                                {voted && <span className="text-(--accent) font-mono font-bold">{poll.totalVotes > 0 ? `${option.percent}%` : '0%'}</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
                                        <span>Total: {poll.totalVotes} votos</span>
                                        <span>Cierra en: {poll.closesIn}</span>
                                    </div>
                                    {voted && (
                                        <p className="text-emerald-400 text-center text-xs font-black uppercase tracking-widest animate-bounce">
                                            {t('suggestions.thanks_vote')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Section>
        </Section>
    )
}
