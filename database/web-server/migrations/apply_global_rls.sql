-- Comprehensive RLS Update for CrystalTides
-- Based on the 'public.profiles' table for role verification

-- 1. SITE POLICIES
ALTER TABLE site_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON site_policies;
DROP POLICY IF EXISTS "Admin All Access" ON site_policies;

CREATE POLICY "Public Read Access" ON site_policies FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON site_policies FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
    )
);

-- 2. SERVER RULES
ALTER TABLE server_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON server_rules;
DROP POLICY IF EXISTS "Admin All Access" ON server_rules;

CREATE POLICY "Public Read Access" ON server_rules FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON server_rules FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
    )
);

-- 3. NEWS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON news;
DROP POLICY IF EXISTS "Admin All Access" ON news;

CREATE POLICY "Public Read Access" ON news FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON news FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
    )
);

-- 4. EVENTS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON events;
DROP POLICY IF EXISTS "Admin All Access" ON events;

CREATE POLICY "Public Read Access" ON events FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON events FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
    )
);

-- 5. POLLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON polls;
DROP POLICY IF EXISTS "Admin All Access" ON polls;

CREATE POLICY "Public Read Access" ON polls FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON polls FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
    )
);

-- 6. POLL OPTIONS
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON poll_options;
DROP POLICY IF EXISTS "Admin All Access" ON poll_options;
DROP POLICY IF EXISTS "Vote Access" ON poll_options;

CREATE POLICY "Public Read Access" ON poll_options FOR SELECT USING (true);
-- We allow authenticated users to update for voting (manual increment approach used in code)
CREATE POLICY "Vote Access" ON poll_options FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin All Access" ON poll_options FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
    )
);

-- 7. TICKETS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Staff can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Staff all access tickets" ON tickets;

CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all tickets" ON tickets
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
        )
    );

CREATE POLICY "Staff all access tickets" ON tickets
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
        )
    );

-- 8. TICKET MESSAGES
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages of own tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Staff all access messages" ON ticket_messages;

CREATE POLICY "Users can view messages of own tickets" ON ticket_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE id = ticket_messages.ticket_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Staff all access messages" ON ticket_messages
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
        )
    );

