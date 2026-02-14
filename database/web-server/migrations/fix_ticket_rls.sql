-- Fix RLS Policies for Ticket System (Critical for Realtime)

-- 1. Ensure RLS is enabled
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users view own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Staff view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users view own messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Staff view all messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Insert messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Update tickets" ON public.tickets;
-- clean up old names if they exist
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins/Staff can view all tickets" ON public.tickets;

-- 3. Define Policies

-- Users can view ONLY their own tickets
CREATE POLICY "Users view own tickets" ON public.tickets
FOR SELECT USING (auth.uid() = user_id);

-- Staff (Admins/Mods) can view ALL tickets
CREATE POLICY "Staff view all tickets" ON public.tickets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator', 'helper', 'developer', 'neroferno', 'killuwu')
  )
);

-- Users can view messages ONLY if they own the ticket
CREATE POLICY "Users view own messages" ON public.ticket_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND tickets.user_id = auth.uid()
  )
);

-- Staff can view ALL messages
CREATE POLICY "Staff view all messages" ON public.ticket_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator', 'helper', 'developer', 'neroferno', 'killuwu')
  )
);

-- Allow authenticated users to insert (create) tickets and messages
CREATE POLICY "Insert tickets" ON public.tickets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Insert messages" ON public.ticket_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow updates (e.g. admins closing tickets, etc.)
CREATE POLICY "Update tickets" ON public.tickets FOR UPDATE USING (auth.role() = 'authenticated');
