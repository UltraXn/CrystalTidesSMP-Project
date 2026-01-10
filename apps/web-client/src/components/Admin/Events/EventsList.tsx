
import { Plus, Dices, Hammer, Users, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "../../UI/Loader";
import { Event, getIconMap, getStatusMap } from "./types";

interface EventsListProps {
    events: Event[];
    loading: boolean;
    onEdit: (event: Event) => void;
    onDelete: (id: number) => void;
    onViewRegistrations: (id: number) => void;
    onNew: () => void;
}

export default function EventsList({ events, loading, onEdit, onDelete, onViewRegistrations, onNew }: EventsListProps) {
    const { t } = useTranslation();
    const iconMap = getIconMap();
    const statusMap = getStatusMap(t);

    if (loading) {
        return (
            <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}>
                <Loader style={{ height: 'auto', minHeight: '100px' }} />
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="poll-empty-state">
                <div className="poll-empty-icon-wrapper">
                    <Dices size={48} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>{t('admin.events.no_events')}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                       Todavía no has programado ningún evento. ¡Empieza creando uno nuevo!
                    </p>
                    <button className="btn-primary" onClick={onNew} style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                        <Plus style={{ marginRight: '10px' }} /> {t('admin.events.create_title')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="event-cards-grid">
            {events.map(event => (
                <div key={event.id} className="event-card-premium">
                    <div className="event-card-top">
                        <div className="event-type-badge">
                            {iconMap[event.type] || <Hammer />}
                        </div>
                        <span className="event-status-badge" style={{
                            color: statusMap[event.status]?.color || '#fff',
                            background: `${statusMap[event.status]?.color}20`,
                            border: `1px solid ${statusMap[event.status]?.color}40`
                        }}>
                            {statusMap[event.status]?.icon}
                            {statusMap[event.status]?.label || event.status}
                        </span>
                    </div>

                    <div className="event-card-body">
                        <h4>{event.title}</h4>
                        <p className="event-description">
                            {event.description}
                        </p>
                    </div>

                    <div className="event-card-footer">
                        <div className="event-stats">
                            <Users size={18} style={{ color: 'var(--accent)' }} />
                            <span>{event.registrations?.length || 0} Registrados</span>
                        </div>
                        <div className="event-actions">
                            <button
                                onClick={() => event.id && onViewRegistrations(event.id)}
                                className="event-btn-action"
                                title={t('admin.events.registrations.view_tooltip')}
                            >
                                <Users />
                            </button>
                            <button
                                onClick={() => onEdit(event)}
                                className="event-btn-action"
                                title={t('admin.events.edit_title')}
                            >
                                <Edit />
                            </button>
                            <button
                                onClick={() => event.id && onDelete(event.id)}
                                className="event-btn-action delete"
                                title={t('admin.events.delete_tooltip')}
                            >
                                <Trash2 />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
