import { useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addTicketMessageSchema, AddTicketMessageFormValues } from '../schemas/ticket'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { Send, ArrowLeft, Shield, Clock, Hash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTicketDetail, fetchTicketMessages, sendTicketMessage } from '../services/ticketService'
import Loader from '../components/UI/Loader'

export default function TicketDetail() {
    const { id } = useParams()
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    const { register, handleSubmit, reset } = useForm<AddTicketMessageFormValues>({
        resolver: zodResolver(addTicketMessageSchema)
    })

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [])

    // Query: Ticket Details
    const { data: ticket, isLoading: loadingTicket } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => fetchTicketDetail(id!),
        enabled: !!id,
    })

    // Query: Ticket Messages
    const { data: messages = [], isLoading: loadingMessages } = useQuery({
        queryKey: ['ticket_messages', id],
        queryFn: () => fetchTicketMessages(id!),
        enabled: !!id,
    })

    // Mutation: Send Message
    const sendMutation = useMutation({
        mutationFn: (message: string) => sendTicketMessage(id!, message),
        onSuccess: () => {
            reset()
            queryClient.invalidateQueries({ queryKey: ['ticket_messages', id] })
            scrollToBottom()
        }
    })

    // Real-time Subscription
    useEffect(() => {
        if (!id) return

        const channel = supabase
            .channel(`ticket_chat_${id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'ticket_messages',
                filter: `ticket_id=eq.${id}`
            }, () => {
                queryClient.invalidateQueries({ queryKey: ['ticket_messages', id] })
                scrollToBottom()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, queryClient, scrollToBottom])

    const handleSendMessage = (data: AddTicketMessageFormValues) => {
        sendMutation.mutate(data.message)
    }

    if (loadingTicket || loadingMessages) return <Loader fullScreen />

    if (!ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white">Ticket no encontrado</h2>
                    <button onClick={() => navigate('/support')} className="text-(--accent) hover:underline flex items-center gap-2 justify-center">
                        <ArrowLeft size={16} /> Volver a Soporte
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 flex flex-col">
            <div className="container max-w-4xl mx-auto px-4 flex-1 flex flex-col">
                
                {/* Header */}
                <header className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/support')} 
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <ArrowLeft className="text-white/60 group-hover:text-white transition-colors" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-white/40 mb-1">
                                <Hash size={14} />
                                <span className="text-xs font-mono uppercase tracking-wider">{ticket.id.slice(0, 8)}</span>
                                <span className="mx-1">•</span>
                                <Clock size={14} />
                                <span className="text-xs uppercase tracking-wider">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">{ticket.subject}</h2>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
                            ticket.status === 'open' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}>
                            {ticket.status}
                        </span>
                        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
                            {ticket.category}
                        </span>
                    </div>
                </header>

                {/* Chat Area */}
                <main className="flex-1 flex flex-col bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Messages List */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {messages.map((msg: any) => {
                                const isMe = user && msg.user_id === user.id
                                
                                return (
                                    <motion.div 
                                        key={msg.id}
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`group relative max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && (
                                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                                    <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                                                        {msg.author?.username || 'Sistema'}
                                                    </span>
                                                    {msg.is_staff && (
                                                        <span className="flex items-center gap-1 bg-red-500/10 text-red-500 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-red-500/20 uppercase tracking-tighter">
                                                            <Shield size={10} strokeWidth={3} /> Staff
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg border ${
                                                isMe 
                                                ? 'bg-(--accent) text-black font-medium rounded-tr-none border-white/10 shadow-(--accent)/10' 
                                                : 'bg-white/5 text-white/90 rounded-tl-none border-white/10'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            
                                            <span className={`block mt-1.5 px-1 text-[10px] font-medium uppercase tracking-widest ${
                                                isMe ? 'text-right text-white/20' : 'text-left text-white/20'
                                            }`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <footer className="p-4 bg-white/2 border-t border-white/5">
                        <form onSubmit={handleSubmit(handleSendMessage)} className="relative flex items-center gap-3">
                            <input 
                                type="text" 
                                placeholder={ticket.status === 'closed' ? t('support.ticket_closed') : t('support.type_message')}
                                {...register('message')}
                                disabled={ticket.status === 'closed' || sendMutation.isPending}
                                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button 
                                type="submit" 
                                disabled={ticket.status === 'closed' || sendMutation.isPending}
                                className="w-14 h-14 bg-(--accent) hover:bg-(--accent)/90 text-black rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-lg shadow-(--accent)/20 group"
                            >
                                <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </form>
                    </footer>
                </main>
            </div>
        </div>
    )
}
