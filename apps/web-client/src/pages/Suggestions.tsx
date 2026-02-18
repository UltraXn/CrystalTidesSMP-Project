import { useEffect } from "react"
import { Send, BarChart2 } from "lucide-react"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { gsap } from "gsap"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchActivePoll, voteInPoll } from "../services/pollService"
import { createSuggestion } from "../services/suggestionService"
import SuggestionForm from "../components/Suggestions/SuggestionForm"
import ActivePoll from "../components/Suggestions/ActivePoll"
import { CreateSuggestionFormValues } from "../schemas/suggestion"

export default function Suggestions() {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    // Query: Fetch Active Poll
    const { data: poll, isLoading: loadingPoll } = useQuery({
        queryKey: ['activePoll'],
        queryFn: fetchActivePoll,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Mutation: Vote
    const voteMutation = useMutation({
        mutationFn: (optionId: number) => {
            if (!poll?.id) throw new Error("No active poll");
            return voteInPoll(poll.id, optionId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activePoll'] })
        }
    })

    // Mutation: Create Suggestion
    const suggestionMutation = useMutation({
        mutationFn: createSuggestion,
    })

    // Entrance animation
    useEffect(() => {
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
        if (voteMutation.isIdle || !poll) {
            await voteMutation.mutateAsync(optionId)
        }
    }

    const handleSuggestionSubmit = async (data: CreateSuggestionFormValues) => {
        await suggestionMutation.mutateAsync(data)
    }

    return (
        <Section title={t('suggestions.title')}>
            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-[1400px] mx-auto px-4">

                    {/* IZQUIERDA: FORMULARIO (3/5) */}
                    <div className="lg:col-span-3 suggestion-column">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) text-xl border border-(--accent)/20">
                                <Send aria-hidden="true" />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {t('suggestions.form_title')}
                            </h3>
                        </div>

                        <SuggestionForm 
                            onSubmit={handleSuggestionSubmit}
                            status={suggestionMutation.isPending ? 'sending' : suggestionMutation.isSuccess ? 'success' : suggestionMutation.isError ? 'error' : 'idle'}
                            onResetStatus={() => suggestionMutation.reset()}
                        />
                    </div>

                    {/* DERECHA: VOTACIONES (2/5) */}
                    <div className="lg:col-span-2 polls-column">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center text-(--accent) text-xl border border-(--accent)/20">
                                <BarChart2 aria-hidden="true" />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {t('suggestions.poll_title')}
                            </h3>
                        </div>

                        <ActivePoll 
                            poll={poll}
                            isLoading={loadingPoll}
                            voted={voteMutation.isSuccess}
                            onVote={handleVote}
                        />
                    </div>
                </div>
            </Section>
        </Section>
    )
}
