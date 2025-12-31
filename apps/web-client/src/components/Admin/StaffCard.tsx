import React from 'react';
import { FaTwitter, FaDiscord, FaYoutube, FaTwitch, FaCheckCircle, FaEdit, FaTrash, FaGripVertical } from 'react-icons/fa';
import MinecraftAvatar from '../UI/MinecraftAvatar';

export interface StaffCardData {
    id: number | string;
    name: string;
    mc_nickname?: string;
    role: string;
    description: string;
    image: string;
    color: string;
    socials: { twitter: string; discord: string; youtube: string; twitch: string; };
}

export interface StaffCardProps {
    data: StaffCardData;
    status: { mc: string; discord: string };
    roleBadge?: string | null;
    onEdit?: () => void;
    onDelete?: () => void;
    dragHandleProps?: any; // props from @hello-pangea/dnd
    innerRef?: React.Ref<HTMLDivElement>;
    draggableProps?: any; // props from @hello-pangea/dnd
    style?: React.CSSProperties;
    t?: (key: string) => string; // Optional translation function for "Edit/Delete" tooltips
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
    style,
    t // kept as prop but unused in default
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
                <FaGripVertical />
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
                        <FaDiscord size={20} />
                        <FaCheckCircle className="verified-dot" />
                    </div>
                )}
                {data.socials?.twitch && (
                    <a href={`https://twitch.tv/${data.socials.twitch}`} target="_blank" rel="noopener noreferrer" className="staff-social-link twitch">
                        <FaTwitch size={20} />
                        <FaCheckCircle className="verified-dot" />
                    </a>
                )}
                {data.socials?.twitter && (
                    <a href={data.socials.twitter} target="_blank" rel="noopener noreferrer" className="staff-social-link twitter">
                        <FaTwitter size={20} />
                    </a>
                )}
                {data.socials?.youtube && (
                    <a href={data.socials.youtube} target="_blank" rel="noopener noreferrer" className="staff-social-link youtube">
                        <FaYoutube size={20} />
                    </a>
                )}
                {(!data.socials?.twitter && !data.socials?.discord && !data.socials?.youtube && !data.socials?.twitch) && (
                    <span className="no-socials-msg">No socials</span>
                )}
            </div>

            <div className="staff-card-actions">
                <button onClick={onEdit} className="staff-btn-edit">
                    <FaEdit /> Edit
                </button>
                <button onClick={onDelete} className="staff-btn-delete" title="Delete">
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default StaffCard;
