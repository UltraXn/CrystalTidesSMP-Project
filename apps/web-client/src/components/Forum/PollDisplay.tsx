import { useState } from 'react'
import { BarChart3, CheckCircle2, ExternalLink } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

interface PollOption {
    id: string;
    label: string;
    percent: number;
    votes: number;
}

interface Poll {
    id: string;
    discord_link?: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    closesIn: string;
}

interface PollDisplayProps {
    poll: Poll | null;
    refreshPoll?: () => void;
    onVote?: (optionId: string) => Promise<void>; // Optional override for testing
}

export default function PollDisplay({ poll, refreshPoll, onVote }: PollDisplayProps) {
    const [voting, setVoting] = useState(false)
    const [voted, setVoted] = useState(false)

    if (!poll) return null

    if (poll.discord_link) {
        return (
            <div style={{ background: '#2f3136', padding: '1.5rem', borderRadius: '8px', border: '1px solid #202225', marginTop: '2rem', display:'flex', alignItems:'center', gap:'1.5rem' }}>
                <svg viewBox="0 0 24 24" fill="#5865F2" width="40" height="40"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                <div>
                    <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Encuesta en Discord</h4>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>Esta encuesta se está llevando a cabo en nuestro servidor de Discord.</p>
                    <a href={poll.discord_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#5865F2', border: 'none', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
                        Ir a Votar <ExternalLink size={12}/>
                    </a>
                </div>
            </div>
        )
    }

    const handleVote = async (optionId: string) => {
        if (voted) return
        setVoting(true)
        try {
            if (onVote) {
                await onVote(optionId);
            } else {
                await fetch(`${API_URL}/polls/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pollId: poll.id, optionId })
                })
            }
            setVoted(true)
            if (refreshPoll) refreshPoll()
        } catch (err) { console.error(err) }
        finally { setVoting(false) }
    }

    return (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--accent)', marginTop: '2rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} /> {poll.question}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {poll.options.map(opt => (
                    <div key={opt.id} onClick={() => !voted && handleVote(opt.id)} style={{ 
                        position: 'relative', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', cursor: voted ? 'default' : 'pointer'
                    }}>
                        <div style={{ 
                            width: `${opt.percent}%`, height: '100%', 
                            background: 'var(--accent)', opacity: 0.2, position: 'absolute', top: 0, left: 0, transition: 'width 0.5s' 
                        }}></div>
                        
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
                            <span style={{ fontWeight: 500, color: '#fff', zIndex: 1 }}>{opt.label}</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--accent)', zIndex: 1 }}>
                                {opt.percent}% {voted && <span style={{fontSize:'0.8rem', color:'#888'}}>({opt.votes})</span>}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.85rem', color: '#888' }}>
                Total: {poll.totalVotes} votos • {poll.closesIn === 'Finalizada' ? 'Finalizada' : `Cierra en ${poll.closesIn}`}
                {voted && <span style={{ marginLeft: '1rem', color: '#22c55e' }}><CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Votado</span>}
            </div>
            {voting && <div style={{marginTop:'0.5rem', color:'var(--accent)', fontSize:'0.9rem'}}>Enviando voto...</div>}
        </div>
    )
}
