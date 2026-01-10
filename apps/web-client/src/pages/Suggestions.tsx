import { useState, useEffect } from "react"
import { Send, BarChart2, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
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

const API_URL = import.meta.env.VITE_API_URL

export default function Suggestions() {
    const { t } = useTranslation()
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    // Form Hook
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateSuggestionFormValues>({
        resolver: zodResolver(createSuggestionSchema),
        defaultValues: {
            nickname: '',
            type: 'General',
            message: ''
        }
    })

    // Poll State
    const [poll, setPoll] = useState<Poll | null>(null)
    const [loadingPoll, setLoadingPoll] = useState(true)
    const [voted, setVoted] = useState(false)

    // Fetch Poll
    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await fetch(`${API_URL}/polls/active`)
                if (res.ok) {
                    const data = await res.json()
                    // Si data es null (200 OK but null body handled in controller), setPoll(null)
                    if(data && data.success) setPoll(data.data)
                }
            } catch (error) {
                console.error("Error fetching poll", error)
            } finally {
                setLoadingPoll(false)
            }
        }
        fetchPoll()

        // Entrance animation
        gsap.fromTo('.suggestion-column, .polls-column', 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                stagger: 0.2, 
                duration: 1, 
                ease: "power3.out",
                delay: 0.3
            }
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
                // Refetch updated stats
                const refresh = await fetch(`${API_URL}/polls/active`)
                const data = await refresh.json()
                setPoll(data.data)
            }
        } catch(err) {
            console.error(err)
        }
    }

    const onSubmit = async (data: CreateSuggestionFormValues) => {
        try {
            const res = await fetch(`${API_URL}/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            
            if(res.ok) {
                setFormStatus('success')
                reset()
            } else {
                setFormStatus('error')
                setTimeout(() => setFormStatus('idle'), 3000)
            }
        } catch {
             setFormStatus('error')
             setTimeout(() => setFormStatus('idle'), 3000)
        }
    }
    
    return (
        <Section title={t('suggestions.title')}>
            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-[1400px] mx-auto px-4">

                    {/* IZQUIERDA: FORMULARIO (3/5) */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) text-xl border border-(--accent)/20">
                                <Send />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {t('suggestions.form_title')}
                            </h3>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
                            {formStatus === 'success' ? (
                                <div className="text-center animate-scale-in py-10">
                                    <CheckCircle size={60} className="text-emerald-400 mx-auto mb-6" />
                                    <h4 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">{t('suggestions.form.received')}</h4>
                                    <p className="text-gray-400 font-medium leading-relaxed max-w-md mx-auto mb-8">{t('suggestions.form.success_msg')}</p>
                                    <button 
                                        onClick={() => setFormStatus('idle')} 
                                        className="px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm transition-all hover:bg-(--accent) hover:scale-105 active:scale-95 shadow-xl"
                                    >
                                        {t('suggestions.form.send_another')}
                                    </button>
                                </div>
                            ) : (
                                <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('suggestions.form.nick')}</label>
                                            <input 
                                                type="text" 
                                                className="bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-(--accent) transition-all placeholder:text-white/10" 
                                                placeholder={t('suggestions.form.nick_placeholder')} 
                                                {...register('nickname')}
                                            />
                                            {errors.nickname && <span className="text-red-500 text-[10px] font-bold uppercase ml-4">{errors.nickname.message}</span>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('suggestions.form.type')}</label>
                                            <select 
                                                className="bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-(--accent) transition-all appearance-none cursor-pointer" 
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
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('suggestions.form.msg')}</label>
                                        <textarea 
                                            className="bg-black/20 border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-(--accent) transition-all placeholder:text-white/10 min-h-[200px] resize-none" 
                                            placeholder={t('suggestions.form.msg_placeholder')} 
                                            {...register('message')}
                                        ></textarea>
                                        {errors.message && <span className="text-red-500 text-[10px] font-bold uppercase ml-4">{errors.message.message}</span>}
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest mt-4 transition-all hover:bg-(--accent) hover:scale-[1.02] active:scale-95 shadow-xl shadow-black disabled:opacity-50" 
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <Loader2 className="animate-spin" /> {t('suggestions.form.sending')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-3">
                                                <Send className="text-xs" /> {t('suggestions.form.submit')}
                                            </span>
                                        )}
                                    </button>
                                    {formStatus === 'error' && <p className="text-red-500 text-center font-bold uppercase tracking-widest text-xs mt-4">{t('suggestions.form.error_msg')}</p>}
                                </form>
                            )}
                        </div>
                    </div>

                    {/* DERECHA: VOTACIONES (2/5) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) text-xl border border-(--accent)/20">
                                <BarChart2 />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {t('suggestions.poll_title')}
                            </h3>
                        </div>

                        {loadingPoll ? (
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-white/20" size={32} />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('suggestions.loading_poll')}</p>
                            </div>
                        ) : !poll ? (
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 text-center opacity-50">
                                <AlertTriangle size={48} className="text-white/10" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-[200px] leading-relaxed">{t('suggestions.no_active_poll')}</p>
                            </div>
                        ) : (
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
                                        <div 
                                            key={option.id} 
                                            className={`relative group h-14 bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all ${voted ? 'cursor-default' : 'cursor-pointer hover:bg-white/10 hover:border-white/20 active:scale-95'}`} 
                                            onClick={() => handleVote(option.id)}
                                        >
                                            {/* Bar Fill */}
                                            <div 
                                                className={`absolute left-0 inset-y-0 transition-all duration-1000 ease-out-expo ${voted ? 'bg-white/10 opacity-100' : 'bg-(--accent)/20 opacity-0 group-hover:opacity-100'}`} 
                                                style={{ width: voted ? `${option.percent}%` : '0%' }}
                                            ></div>
                                            
                                            <div className="relative z-10 h-full flex items-center justify-between px-6 pointer-events-none">
                                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${voted ? 'text-white' : 'text-gray-400'}`}>{option.label}</span>
                                                {voted && <span className="text-(--accent) font-mono font-bold">{poll.totalVotes > 0 ? `${option.percent}%` : '0%'}</span>}
                                            </div>
                                        </div>
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
