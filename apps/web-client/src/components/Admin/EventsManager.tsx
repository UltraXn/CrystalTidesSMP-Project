import React, { useState, useEffect, useCallback } from "react";
import { FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { supabase } from "../../services/supabaseClient";
import { getAuthHeaders } from "../../services/adminAuth";
import { Event, Registration } from "./Events/types";
import EventFormModal from "./Events/EventFormModal";
import EventDeleteModal from "./Events/EventDeleteModal";
import RegistrationsModal from "./Events/RegistrationsModal";
import EventsList from "./Events/EventsList";

interface EventsManagerProps {
    mockEvents?: Event[];
    mockRegistrationsMap?: Record<number, Registration[]>;
}

export default function EventsManager({ mockEvents, mockRegistrationsMap }: EventsManagerProps = {}) {
    const { t } = useTranslation();
    const [events, setEvents] = useState<Event[]>(mockEvents || []);
    const [loading, setLoading] = useState(true);
    
    // CRUD State
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [showRegistrationsModal, setShowRegistrationsModal] = useState<number | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    const fetchEvents = useCallback(async () => {
        if (mockEvents) return;
        try {
            const res = await fetch(`${API_URL}/events`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setEvents(data);
            }
        } catch (error) {
            console.error("Error cargando eventos:", error);
        } finally {
            setLoading(false);
        }
    }, [API_URL, mockEvents]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

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
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/events/${deleteConfirm}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            setEvents(events.filter(e => e.id !== deleteConfirm));
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error eliminando evento:", error);
            alert(t('admin.events.error_delete'));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentEvent) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                alert("No active session. Please log in.");
                return;
            }

            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session.access_token)
            };

            let res;
            
            if (currentEvent.id) {
                // UPDATE
                res = await fetch(`${API_URL}/events/${currentEvent.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(currentEvent)
                });
            } else {
                // CREATE
                res = await fetch(`${API_URL}/events`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(currentEvent)
                });
            }

            if (!res.ok) throw new Error('Error al guardar');

            await fetchEvents();
            setIsEditing(false);
        } catch (error) {
            console.error("Error guardando evento:", error);
            alert(t('admin.events.error_save'));
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
            />
        );
    }

    return (
        <div className="event-manager-container">
            <div className="event-header">
                <h3>{t('admin.events.title')}</h3>
                <button className="btn-primary poll-new-btn" onClick={handleNew}>
                    <FaPlus size={14} /> {t('admin.events.create_title')}
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
