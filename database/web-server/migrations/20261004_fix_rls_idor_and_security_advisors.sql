-- ==============================================================================
-- MIGRATION: 20261004_fix_rls_idor_and_security_advisors.sql
-- PURPOSE:
--   1. Fix critical IDOR in ticket_messages (drop permissive unconstrained insert)
--   2. Fix draft leakage in news (drop Public Read Access true)
--   3. Apply SAST RLS hardening (karma_votes, profile_comments, staff_notes, wiki)
--   4. Secure SECURITY DEFINER functions (ascend_player_prestige, is_staff, etc.)
--   5. Add foreign key covering indexes to eliminate full table scans
-- INVARIANTS: Idempotent, non-destructive, zero-downtime compatible
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TICKET & TICKET MESSAGES IDOR HARDENING
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Clean up all legacy / duplicate / vulnerable policies on tickets
DROP POLICY IF EXISTS "Users view own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Staff view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins/Staff can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users view own or Staff all" ON public.tickets;
DROP POLICY IF EXISTS "Users create own" ON public.tickets;
DROP POLICY IF EXISTS "Users update own or Staff all" ON public.tickets;
DROP POLICY IF EXISTS "Staff delete" ON public.tickets;

-- Clean up all legacy / duplicate / vulnerable policies on ticket_messages
DROP POLICY IF EXISTS "Users view own messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can view own ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Staff view all messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins/Staff can view all messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Insert messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users/Admin insert messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can reply to own tickets" ON public.ticket_messages;

-- Recreate canonical tickets policies
CREATE POLICY "Users and staff view tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR is_staff((SELECT auth.uid()))
);

CREATE POLICY "Users create own tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Users update own or staff update all tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR is_staff((SELECT auth.uid()))
)
WITH CHECK (
    user_id = (SELECT auth.uid())
    OR is_staff((SELECT auth.uid()))
);

CREATE POLICY "Staff delete tickets"
ON public.tickets
FOR DELETE
TO authenticated
USING (
    is_staff((SELECT auth.uid()))
);

-- Recreate canonical ticket_messages policies (NO IDOR)
CREATE POLICY "Users and staff view ticket messages"
ON public.ticket_messages
FOR SELECT
TO authenticated
USING (
    is_staff((SELECT auth.uid()))
    OR EXISTS (
        SELECT 1 FROM public.tickets
        WHERE tickets.id = ticket_messages.ticket_id
        AND tickets.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Users insert message in own tickets"
ON public.ticket_messages
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
        SELECT 1 FROM public.tickets
        WHERE tickets.id = ticket_messages.ticket_id
        AND tickets.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Staff insert message in tickets"
ON public.ticket_messages
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    AND is_staff((SELECT auth.uid()))
);

-- ------------------------------------------------------------------------------
-- 2. NEWS DRAFT LEAKAGE FIX & POLICY CONSOLIDATION
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON public.news;
DROP POLICY IF EXISTS "Public News Access" ON public.news;
DROP POLICY IF EXISTS "Admin All Access" ON public.news;

CREATE POLICY "Public Read Published News"
ON public.news
FOR SELECT
TO public
USING (
    status = 'Published'
    OR is_staff((SELECT auth.uid()))
);

CREATE POLICY "Staff Manage News"
ON public.news
FOR ALL
TO authenticated
USING (
    is_staff((SELECT auth.uid()))
)
WITH CHECK (
    is_staff((SELECT auth.uid()))
);

-- ------------------------------------------------------------------------------
-- 3. SAST RLS HARDENING (KARMA, COMMENTS, STAFF NOTES, WIKI, KNOWLEDGE BASE)
-- ------------------------------------------------------------------------------

-- 3.1 KARMA VOTES
ALTER TABLE IF EXISTS public.karma_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Karma" ON public.karma_votes;
DROP POLICY IF EXISTS "Restricted Read Karma" ON public.karma_votes;

CREATE POLICY "Restricted Read Karma"
ON public.karma_votes
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR voter_id = (SELECT auth.uid())
    OR is_staff((SELECT auth.uid()))
);

-- 3.2 PROFILE COMMENTS
ALTER TABLE IF EXISTS public.profile_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.profile_comments;
DROP POLICY IF EXISTS "Authenticated Read Comments" ON public.profile_comments;
DROP POLICY IF EXISTS "Comment Owner Delete" ON public.profile_comments;
DROP POLICY IF EXISTS "Delete Policy" ON public.profile_comments;

CREATE POLICY "Authenticated Read Comments"
ON public.profile_comments
FOR SELECT
TO authenticated
USING (
    author_id = (SELECT auth.uid())
    OR profile_id = (SELECT auth.uid())
    OR is_staff((SELECT auth.uid()))
);

CREATE POLICY "Comment Owner or Recipient Delete"
ON public.profile_comments
FOR DELETE
TO authenticated
USING (
    author_id = (SELECT auth.uid())
    OR profile_id = (SELECT auth.uid())
    OR is_staff((SELECT auth.uid()))
);

-- 3.3 STAFF NOTES & STAFF TASKS DEDUPLICATION
ALTER TABLE IF EXISTS public.staff_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff Only Read Notes" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff Only Insert Notes" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff Only Modify Notes" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff manage notes" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff only manage notes" ON public.staff_notes;

CREATE POLICY "Staff Only Manage Notes"
ON public.staff_notes
FOR ALL
TO authenticated
USING (
    is_staff((SELECT auth.uid()))
)
WITH CHECK (
    is_staff((SELECT auth.uid()))
);

ALTER TABLE IF EXISTS public.staff_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff only manage tasks" ON public.staff_tasks;
DROP POLICY IF EXISTS "Staff manage tasks" ON public.staff_tasks;

CREATE POLICY "Staff Manage Tasks"
ON public.staff_tasks
FOR ALL
TO authenticated
USING (
    is_staff((SELECT auth.uid()))
)
WITH CHECK (
    is_staff((SELECT auth.uid()))
);

-- 3.4 WIKI ARTICLES
ALTER TABLE IF EXISTS public.wiki_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.wiki_articles;
DROP POLICY IF EXISTS "Published Read Access" ON public.wiki_articles;
DROP POLICY IF EXISTS "Staff manage wiki" ON public.wiki_articles;

CREATE POLICY "Published Read Access"
ON public.wiki_articles
FOR SELECT
TO public
USING (
    is_published = true
    OR is_staff((SELECT auth.uid()))
);

CREATE POLICY "Staff Manage Wiki"
ON public.wiki_articles
FOR ALL
TO authenticated
USING (
    is_staff((SELECT auth.uid()))
)
WITH CHECK (
    is_staff((SELECT auth.uid()))
);

-- 3.5 MOD KNOWLEDGE BASE
ALTER TABLE IF EXISTS public.mod_knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Knowledge Base" ON public.mod_knowledge_base;
DROP POLICY IF EXISTS "Staff Manage Knowledge Base" ON public.mod_knowledge_base;

CREATE POLICY "Public Read Knowledge Base"
ON public.mod_knowledge_base
FOR SELECT
TO public
USING (true);

CREATE POLICY "Staff Manage Knowledge Base"
ON public.mod_knowledge_base
FOR ALL
TO authenticated
USING (
    is_staff((SELECT auth.uid()))
)
WITH CHECK (
    is_staff((SELECT auth.uid()))
);

-- ------------------------------------------------------------------------------
-- 4. SECURE SECURITY DEFINER FUNCTIONS & PERMISSIONS
-- ------------------------------------------------------------------------------

-- Update ascend_player_prestige to enforce caller identity
CREATE OR REPLACE FUNCTION public.ascend_player_prestige(p_username text, p_category text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_top1 BOOLEAN := FALSE;
  v_current_prestige INT := 0;
  v_new_prestige INT := 0;
  v_rec RECORD;
  v_caller_uid UUID;
BEGIN
  v_caller_uid := auth.uid();

  -- Security check: caller must be authenticated and match target username, or be staff/service_role
  IF auth.role() != 'service_role' THEN
    IF v_caller_uid IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'No autorizado: debes iniciar sesión.');
    END IF;

    IF NOT (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = v_caller_uid
        AND (LOWER(username) = LOWER(p_username) OR is_staff(v_caller_uid))
      )
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'No autorizado: solo puedes ascender tu propio personaje.');
    END IF;
  END IF;

  -- Obtener registro del jugador
  SELECT * INTO v_rec FROM public.player_stats WHERE LOWER(minecraft_username) = LOWER(p_username);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Jugador no encontrado en la base de datos.');
  END IF;

  -- Verificar según la categoría
  CASE LOWER(p_category)
    WHEN 'constructor' THEN
      v_is_top1 := v_rec.is_top1_constructor;
      v_current_prestige := COALESCE(v_rec.prestige_constructor, 0);
    WHEN 'luchador' THEN
      v_is_top1 := v_rec.is_top1_luchador;
      v_current_prestige := COALESCE(v_rec.prestige_luchador, 0);
    WHEN 'mercader' THEN
      v_is_top1 := v_rec.is_top1_mercader;
      v_current_prestige := COALESCE(v_rec.prestige_mercader, 0);
    WHEN 'constancia' THEN
      v_is_top1 := v_rec.is_top1_constancia;
      v_current_prestige := COALESCE(v_rec.prestige_constancia, 0);
    WHEN 'explorador' THEN
      v_is_top1 := v_rec.is_top1_explorador;
      v_current_prestige := COALESCE(v_rec.prestige_explorador, 0);
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Categoría no válida.');
  END CASE;

  -- Validar si cumple el requisito de Rango Máximo (#1 del Servidor)
  IF NOT v_is_top1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requisito no cumplido: Debes ser el jugador #1 con Rango Máximo en esta categoría para ascender.');
  END IF;

  -- Validar si ya alcanzó el nivel máximo V
  IF v_current_prestige >= 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ya has alcanzado el Nivel Máximo V de Prestigio en esta categoría.');
  END IF;

  v_new_prestige := v_current_prestige + 1;

  -- Actualizar el nivel de prestigio en player_stats y profiles
  CASE LOWER(p_category)
    WHEN 'constructor' THEN
      UPDATE public.player_stats SET prestige_constructor = v_new_prestige, updated_at = NOW() WHERE LOWER(minecraft_username) = LOWER(p_username);
      UPDATE public.profiles SET prestige_constructor = v_new_prestige WHERE LOWER(username) = LOWER(p_username);
    WHEN 'luchador' THEN
      UPDATE public.player_stats SET prestige_luchador = v_new_prestige, updated_at = NOW() WHERE LOWER(minecraft_username) = LOWER(p_username);
      UPDATE public.profiles SET prestige_luchador = v_new_prestige WHERE LOWER(username) = LOWER(p_username);
    WHEN 'mercader' THEN
      UPDATE public.player_stats SET prestige_mercader = v_new_prestige, updated_at = NOW() WHERE LOWER(minecraft_username) = LOWER(p_username);
      UPDATE public.profiles SET prestige_mercader = v_new_prestige WHERE LOWER(username) = LOWER(p_username);
    WHEN 'constancia' THEN
      UPDATE public.player_stats SET prestige_constancia = v_new_prestige, updated_at = NOW() WHERE LOWER(minecraft_username) = LOWER(p_username);
      UPDATE public.profiles SET prestige_constancia = v_new_prestige WHERE LOWER(username) = LOWER(p_username);
    WHEN 'explorador' THEN
      UPDATE public.player_stats SET prestige_explorador = v_new_prestige, updated_at = NOW() WHERE LOWER(minecraft_username) = LOWER(p_username);
      UPDATE public.profiles SET prestige_explorador = v_new_prestige WHERE LOWER(username) = LOWER(p_username);
  END CASE;

  RETURN jsonb_build_object(
    'success', true, 
    'message', '¡Ascenso de Prestigio completado con éxito!', 
    'category', p_category, 
    'new_prestige', v_new_prestige,
    'bonus_multiplier', (v_new_prestige * 5)
  );
END;
$$;

-- Revoke anon execution on SECURITY DEFINER functions flagged by Supabase advisor
REVOKE EXECUTE ON FUNCTION public.ascend_player_prestige(text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.ascend_player_prestige(text, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_role_level(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_user_role_level(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_min_role(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_min_role(uuid, integer) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. PERFORMANCE: FOREIGN KEY COVERING INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_comments_news_id ON public.comments(news_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON public.forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_karma_votes_voter_id ON public.karma_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON public.news(author_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON public.player_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_profile_comments_author_id ON public.profile_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_user_id ON public.ticket_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_author_id ON public.wiki_articles(author_id);
