-- Migration: Add caching fields to tournaments
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sync_status text check (sync_status in ('success', 'error', 'pending'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_last_synced ON public.tournaments(last_synced_at);
