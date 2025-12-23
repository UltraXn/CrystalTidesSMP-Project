import { useState } from 'react'
import { FaPoll, FaCheckCircle, FaDiscord, FaExternalLinkAlt } from 'react-icons/fa'

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
}

export default function PollDisplay({ poll, refreshPoll }: PollDisplayProps) {
    const [voting, setVoting] = useState(false)
    const [voted, setVoted] = useState(false)

    if (!poll) return null

    if (poll.discord_link) {
        return (
            <div style={{ background: '#2f3136', padding: '1.5rem', borderRadius: '8px', border: '1px solid #202225', marginTop: '2rem', display:'flex', alignItems:'center', gap:'1.5rem' }}>
                <FaDiscord size={40} color="#5865F2" />
                <div>
                    <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Encuesta en Discord</h4>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>Esta encuesta se está llevando a cabo en nuestro servidor de Discord.</p>
                    <a href={poll.discord_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#5865F2', border: 'none', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
                        Ir a Votar <FaExternalLinkAlt size={12}/>
                    </a>
                </div>
            </div>
        )
    }

    const handleVote = async (optionId: string) => {
        if (voted) return
        setVoting(true)
        try {
            await fetch(`${API_URL}/polls/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pollId: poll.id, optionId })
            })
            setVoted(true)
            if (refreshPoll) refreshPoll()
        } catch (err) { console.error(err) }
        finally { setVoting(false) }
    }

    return (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--accent)', marginTop: '2rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaPoll /> {poll.question}
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
                {voted && <span style={{ marginLeft: '1rem', color: '#22c55e' }}><FaCheckCircle /> Votado</span>}
            </div>
            {voting && <div style={{marginTop:'0.5rem', color:'var(--accent)', fontSize:'0.9rem'}}>Enviando voto...</div>}
        </div>
    )
}
