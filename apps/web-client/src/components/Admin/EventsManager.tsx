import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Event, Registration } from "./Events/types";
import EventFormModal from "./Events/EventFormModal";
import EventDeleteModal from "./Events/EventDeleteModal";
import RegistrationsModal from "./Events/RegistrationsModal";
import EventsList from "./Events/EventsList";
import { 
    useAdminEvents, 
    useCreateEvent, 
    useUpdateEvent, 
    useDeleteEvent 
} from "../../hooks/useAdminData";

interface EventsManagerProps {
    mockEvents?: Event[];
    mockRegistrationsMap?: Record<number, Registration[]>;
}

export default function EventsManager({ mockEvents, mockRegistrationsMap }: EventsManagerProps = {}) {
    const { t } = useTranslation();
    
    // TanStack Query Hooks
    const { data: fetchEventsData, isLoading: loading } = useAdminEvents();
    const createMutation = useCreateEvent();
    const updateMutation = useUpdateEvent();
    const deleteMutation = useDeleteEvent();

    const events = mockEvents || fetchEventsData || [];

    // Local UI State
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [showRegistrationsModal, setShowRegistrationsModal] = useState<number | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    const handleNew = () => {
        setCurrentEvent({ 
            title: "", 
            title_en: "", 
            description: "", 
            description_en: "", 
            type: "hammer", 
            status: "soon", 
            image_url: "" 
        });
        setIsEditing(true);
    };

    const handleEdit = (event: Event) => {
        setCurrentEvent(event);
        setIsEditing(true);
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        deleteMutation.mutate(deleteConfirm, {
            onSuccess: () => setDeleteConfirm(null)
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentEvent) return;

        if (currentEvent.id) {
            updateMutation.mutate({ id: currentEvent.id, payload: currentEvent }, {
                onSuccess: () => setIsEditing(false)
            });
        } else {
            createMutation.mutate(currentEvent, {
                onSuccess: () => setIsEditing(false)
            });
        }
    };

    if (isEditing && currentEvent) {
        return (
            <EventFormModal 
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
                currentEvent={currentEvent}
                setCurrentEvent={setCurrentEvent}
                API_URL={API_URL}
                saving={createMutation.isPending || updateMutation.isPending}
            />
        );
    }

    return (
        <div className="event-manager-container">
            <div className="event-header">
                <h3>{t('admin.events.title')}</h3>
                <button className="btn-primary poll-new-btn" onClick={handleNew}>
                    <Plus size={14} /> {t('admin.events.create_title')}
                </button>
            </div>

            <EventsList 
                events={events}
                loading={loading}
                onEdit={handleEdit}
                onDelete={setDeleteConfirm}
                onViewRegistrations={setShowRegistrationsModal}
                onNew={handleNew}
            />

            <EventDeleteModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={executeDelete}
                deleting={deleteMutation.isPending}
            />

            {showRegistrationsModal && (
                <RegistrationsModal 
                    eventId={showRegistrationsModal} 
                    onClose={() => setShowRegistrationsModal(null)} 
                    API_URL={API_URL}
                    mockRegistrations={mockRegistrationsMap?.[showRegistrationsModal]}
                />
            )}
        </div>
    );
}
