-- Enable Realtime for Ticket System Tables
-- This is required for .subscribe() to work on the frontend

BEGIN;

  -- Add tables to the publication used by Supabase Realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

COMMIT;
