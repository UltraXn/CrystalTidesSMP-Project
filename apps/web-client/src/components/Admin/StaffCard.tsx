import React from 'react';
import { CheckCircle, Edit, Trash2, GripVertical } from 'lucide-react';

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
);

const TwitchIcon = ({ size = 20 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
    </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/>
    </svg>
);

const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);
import MinecraftAvatar from '../UI/MinecraftAvatar';

export interface StaffCardData {
    id: number | string;
    name: string;
    mc_nickname?: string;
    role: string;
    description: string;
    image: string;
    color: string;
    socials?: { twitter?: string; discord?: string; youtube?: string; twitch?: string; };
}

export interface StaffCardProps {
    data: StaffCardData;
    status: { mc: string; discord: string };
    roleBadge?: string | null;
    onEdit?: () => void;
    onDelete?: () => void;
    dragHandleProps?: import('@hello-pangea/dnd').DraggableProvidedDragHandleProps | null;
    innerRef?: React.Ref<HTMLDivElement>;
    draggableProps?: import('@hello-pangea/dnd').DraggableProvidedDraggableProps | null;
    style?: React.CSSProperties;
}

export const StaffCard: React.FC<StaffCardProps> = ({ 
    data, 
    status, 
    roleBadge, 
    onEdit, 
    onDelete, 
    dragHandleProps,
    innerRef,
    draggableProps,
    style
}) => {
    return (
        <div 
            ref={innerRef}
            {...draggableProps}
            className="staff-card-premium"
            style={{ 
                borderTopColor: data.color,
                ...style
            }}
        >
            <div 
                {...dragHandleProps}
                className="staff-card-drag-handle"
                title="Drag to reorder"
            >
                <GripVertical />
            </div>

            <div className="staff-avatar-wrapper">
                <div className="staff-avatar-ring" style={{ boxShadow: `0 0 20px ${data.color}20` }}>
                    <div className="staff-avatar-content">
                        <MinecraftAvatar 
                            src={data.image || data.mc_nickname || data.name} 
                            alt={data.name} 
                            size={128}
                        />
                    </div>
                </div>
                {/* Online Status Indicator (Double) */}
                <div className="staff-status-indicators">
                    <div 
                        className={`status-orb-mini mc ${status.mc === 'online' ? 'online' : 'offline'}`}
                        title={`MC: ${status.mc}`}
                    />
                    <div 
                        className={`status-orb-mini discord ${status.discord !== 'offline' ? status.discord : 'offline'}`}
                        title={`Discord: ${status.discord}`}
                    />
                </div>
            </div>

            <div className="staff-info-section">
                <h4>{data.name}</h4>
                
                {roleBadge ? (
                    <div className="role-badge-img">
                        <img src={roleBadge} alt={data.role} />
                    </div>
                ) : (
                    <span className="staff-role-badge" style={{ color: data.color, background: `${data.color}15`, border: `1px solid ${data.color}30` }}>
                        {data.role}
                    </span>
                )}
            </div>

            <p className="staff-description">
                {data.description || "No description"}
            </p>

            <div className="staff-social-strip">
                {data.socials?.discord && (
                    <div title={`Discord: ${data.socials.discord}`} className="staff-social-link discord">
                        <DiscordIcon size={20} />
                        <CheckCircle className="verified-dot" size={14} />
                    </div>
                )}
                {data.socials?.twitch && (
                    <a href={`https://twitch.tv/${data.socials.twitch}`} target="_blank" rel="noopener noreferrer" className="staff-social-link twitch">
                        <TwitchIcon size={20} />
                        <CheckCircle className="verified-dot" size={14} />
                    </a>
                )}
                {data.socials?.twitter && (
                    <a href={data.socials.twitter} target="_blank" rel="noopener noreferrer" className="staff-social-link twitter">
                        <TwitterIcon size={20} />
                    </a>
                )}
                {data.socials?.youtube && (
                    <a href={data.socials.youtube} target="_blank" rel="noopener noreferrer" className="staff-social-link youtube">
                        <YoutubeIcon size={20} />
                    </a>
                )}
                {(!data.socials?.twitter && !data.socials?.discord && !data.socials?.youtube && !data.socials?.twitch) && (
                    <span className="no-socials-msg">No socials</span>
                )}
            </div>

            <div className="staff-card-actions">
                <button onClick={onEdit} className="staff-btn-edit">
                    <Edit size={16} /> Edit
                </button>
                <button onClick={onDelete} className="staff-btn-delete" title="Delete">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default StaffCard;
