-- ==========================================
-- SEED FULL FECHA 1 (LIGA PROFESIONAL 2026)
-- ==========================================

DO $$
DECLARE 
  v_comp_id uuid;
  v_slip_id uuid;
BEGIN
  -- 1. Find the existing slip for Fecha 1
  SELECT id INTO v_comp_id FROM public.competitions WHERE slug = 'liga-2026' LIMIT 1;
  SELECT id INTO v_slip_id FROM public.prode_slips WHERE round_name = 'Fecha 1' AND competition_id = v_comp_id LIMIT 1;

  IF v_slip_id IS NOT NULL THEN
      -- 6. San Lorenzo vs Union
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'San Lorenzo', 'Union Santa Fe', '2026-01-25 19:30:00+00')
      ON CONFLICT DO NOTHING;

      -- 7. Velez Sarsfield vs Huracan
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Velez Sarsfield', 'Huracan', '2026-01-25 21:00:00+00')
      ON CONFLICT DO NOTHING;

      -- 8. Rosario Central vs Talleres
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Rosario Central', 'Talleres CBA', '2026-01-26 18:00:00+00')
      ON CONFLICT DO NOTHING;

      -- 9. Belgrano vs Newell''s
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Belgrano', 'Newells Old Boys', '2026-01-26 20:00:00+00')
      ON CONFLICT DO NOTHING;

      -- 10. Lanus vs Banfield
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Lanus', 'Banfield', '2026-01-26 22:15:00+00')
      ON CONFLICT DO NOTHING;

      -- 11. Defensa y Justicia vs Platense
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Defensa y Justicia', 'Platense', '2026-01-27 18:00:00+00')
      ON CONFLICT DO NOTHING;

      -- 12. Atletico Tucuman vs Godoy Cruz
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Atletico Tucuman', 'Godoy Cruz', '2026-01-27 20:00:00+00')
      ON CONFLICT DO NOTHING;

      -- 13. Instituto vs Tigre
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Instituto ACC', 'Tigre', '2026-01-27 22:15:00+00')
      ON CONFLICT DO NOTHING;

      -- 14. Central Cordoba vs Riestra (Modified previous if needed, but adding a new one for full count)
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
      VALUES (v_slip_id, 'Central Cordoba', 'Deportivo Riestra', '2026-01-28 18:00:00+00')
      ON CONFLICT DO NOTHING;
  END IF;

END $$;
