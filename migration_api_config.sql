-- Configure API-Football League IDs
-- We map our internal competitions to the API IDs.
-- IDs: 
-- 128 = Liga Profesional Argentina
-- 2 = UEFA Champions League
-- 13 = Copa Libertadores
-- 11 = Copa Sudamericana

-- 1. Ensure Tournaments Exist and Update IDs
INSERT INTO public.tournaments (name, slug, api_league_id, current_season, is_active)
VALUES 
    ('Liga Profesional 2026', 'liga-2026', 128, 2026, true),
    ('UEFA Champions League 2026', 'champions-2026', 2, 2025, true), -- Season usually spans 2 years, API uses start year (e.g. 2025 for 25/26)
    ('Copa Libertadores 2026', 'libertadores-2026', 13, 2026, true),
    ('Copa Sudamericana 2026', 'sudamericana-2026', 11, 2026, true)
ON CONFLICT (api_league_id) 
DO UPDATE SET 
    current_season = EXCLUDED.current_season,
    is_active = true,
    slug = EXCLUDED.slug;

-- 2. Clean duplicate names if slugs didn't match (Optional maintenance)
-- (Skipping for safety, relying on API ID as unique constraint if schema supports it, 
--  otherwise we might have duplicates if we ran this blindly. 
--  Assuming 'api_league_id' is unique in schema from previous migration check).
