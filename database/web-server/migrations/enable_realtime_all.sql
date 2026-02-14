-- Enable Realtime for all Admin Modules
-- Run this in the Supabase SQL Editor to allow .subscribe() functionality on the frontend

BEGIN;

  -- Add tables to the publication used by Supabase Realtime
  -- Note: If some tables are already in, Postgres will ignore them or you can use IF NOT EXISTS logic if supported 
  -- but standard ALTER PUBLICATION ADD TABLE is safer to just list what we need.

  -- If you get an error that the table is already in the publication, you can ignore it or 
  -- remove the specific line.

  ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_notes;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;

COMMIT;
