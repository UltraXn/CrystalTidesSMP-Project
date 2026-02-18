import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSuggestionSchema, CreateSuggestionFormValues } from "../../schemas/suggestion"
import { Send, CheckCircle, Loader2 } from "lucide-react"

interface SuggestionFormProps {
    onSubmit: (data: CreateSuggestionFormValues) => Promise<void>;
    status: 'idle' | 'sending' | 'success' | 'error';
    onResetStatus: () => void;
}

export default function SuggestionForm({ onSubmit, status, onResetStatus }: SuggestionFormProps) {
    const { t } = useTranslation()

    // Form Hook
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateSuggestionFormValues>({
        resolver: zodResolver(createSuggestionSchema),
        defaultValues: {
            nickname: '',
            type: 'General',
            message: ''
        }
    })

    const handleFormSubmit = async (data: CreateSuggestionFormValues) => {
        await onSubmit(data)
        if (status === 'success') {
            reset()
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm text-center animate-scale-in py-10">
                <CheckCircle size={60} className="text-emerald-400 mx-auto mb-6" />
                <h4 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">{t('suggestions.form.received')}</h4>
                <p className="text-gray-400 font-medium leading-relaxed max-w-md mx-auto mb-8">{t('suggestions.form.success_msg')}</p>
                <button 
                    onClick={onResetStatus} 
                    className="px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm transition-all hover:bg-(--accent) hover:scale-105 active:scale-95 shadow-xl"
                >
                    {t('suggestions.form.send_another')}
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
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
                    disabled={status === 'sending'}
                >
                    {status === 'sending' ? (
                        <span className="flex items-center justify-center gap-3">
                            <Loader2 className="animate-spin" /> {t('suggestions.form.sending')}
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-3">
                            <Send className="text-xs" /> {t('suggestions.form.submit')}
                        </span>
                    )}
                </button>
                {status === 'error' && <p className="text-red-500 text-center font-bold uppercase tracking-widest text-xs mt-4">{t('suggestions.form.error_msg')}</p>}
            </form>
        </div>
    )
}
