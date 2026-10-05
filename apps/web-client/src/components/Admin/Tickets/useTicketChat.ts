import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { getAuthHeaders } from '../../../services/adminAuth';
import { Ticket, Message } from './types';

export function useTicketChat(
  ticket: Ticket,
  user: { id: string } | null,
  mockMessages?: Message[],
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const scheduleScroll = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (mockMessages) {
      setMessages(mockMessages);
      scheduleScroll();
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: HeadersInit = getAuthHeaders(session?.access_token || null);

      const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMessages(data.data);
        } else if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
        scheduleScroll();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [ticket.id, mockMessages, API_URL, scheduleScroll]);

  const handleNewMessagePayload = useCallback(
    (payload: { new: Message }) => {
      setMessages((prev) =>
        prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new as Message],
      );
      scheduleScroll();
    },
    [scheduleScroll],
  );

  useEffect(() => {
    if (ticket) {
      fetchMessages();

      const channel = supabase
        .channel(`ticket_chat_admin_${ticket.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages',
            filter: `ticket_id=eq.${ticket.id}`,
          },
          handleNewMessagePayload,
        )
        .subscribe();

      return () => {
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        channel.unsubscribe();
        supabase.removeChannel(channel);
      };
    }
  }, [ticket, fetchMessages, handleNewMessagePayload]);

  const handleSendMessage = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(session?.access_token || null),
      };

      const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: user.id,
          message: newMessage,
          is_staff: true,
        }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sending,
    scrollRef,
    handleSendMessage,
  };
}
