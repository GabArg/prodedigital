-- ==========================================
-- SEED REAL MATCHES (JANUARY 2026)
-- ==========================================

DO $$
DECLARE 
  v_comp_id uuid;
  v_slip_id uuid;
BEGIN
  -- 1. Get the Competition ID (Liga Profesional 2026)
  SELECT id INTO v_comp_id FROM public.competitions WHERE slug = 'liga-2026' LIMIT 1;

  IF v_comp_id IS NOT NULL THEN
      -- 2. Create the "Fecha 1" Slip
      INSERT INTO public.prode_slips (tournament_name, round_name, close_date, entry_cost, status, competition_id)
      VALUES ('Torneo Apertura 2026', 'Fecha 1', '2026-01-25 21:00:00+00', 200, 'open', v_comp_id)
      ON CONFLICT DO NOTHING
      RETURNING id INTO v_slip_id;

      -- 3. If slip was created (or if we find it by name if returning was null due to conflict)
      IF v_slip_id IS NULL THEN
          SELECT id INTO v_slip_id FROM public.prode_slips WHERE round_name = 'Fecha 1' AND competition_id = v_comp_id LIMIT 1;
      END IF;

      -- 4. Insert Real Matches
      IF v_slip_id IS NOT NULL THEN
          -- River won 1-0 away (Final Result '2')
          INSERT INTO public.matches (slip_id, home_team, away_team, start_time, final_result)
          VALUES (v_slip_id, 'Barracas Central', 'River Plate', '2026-01-24 18:00:00+00', '2')
          ON CONFLICT DO NOTHING;

          -- Independiente drew (Final Result 'X')
          INSERT INTO public.matches (slip_id, home_team, away_team, start_time, final_result)
          VALUES (v_slip_id, 'Independiente', 'Estudiantes LP', '2026-01-23 18:00:00+00', 'X')
          ON CONFLICT DO NOTHING;

          -- Gimnasia won 2-1 (Final Result '1')
          INSERT INTO public.matches (slip_id, home_team, away_team, start_time, final_result)
          VALUES (v_slip_id, 'Gimnasia LP', 'Racing Club', '2026-01-24 20:00:00+00', '1')
          ON CONFLICT DO NOTHING;

          -- Upcoming: Boca vs Riestra (No result yet)
          INSERT INTO public.matches (slip_id, home_team, away_team, start_time)
          VALUES (v_slip_id, 'Boca Juniors', 'Deportivo Riestra', '2026-01-25 21:30:00+00')
          ON CONFLICT DO NOTHING;

          -- Upcoming: Argentinos vs Sarmiento
          INSERT INTO public.matches (slip_id, home_team, away_team, start_time, tournament_id, round_name)
          VALUES (v_slip_id, 'Argentinos Jrs', 'Sarmiento', '2026-01-25 21:00:00+00', v_comp_id, 'Fecha 1')
          ON CONFLICT DO NOTHING;

      END IF;

      -- =============================================
      -- FECHA 2 (LIGA)
      -- =============================================
      INSERT INTO public.matches (slip_id, home_team, away_team, start_time, tournament_id, round_name)
      VALUES 
        (uuid_generate_v4(), 'River Plate', 'Tigre', '2026-02-01 17:00:00+00', v_comp_id, 'Fecha 2'),
        (uuid_generate_v4(), 'Boca Juniors', 'Central Cordoba', '2026-02-01 19:15:00+00', v_comp_id, 'Fecha 2'),
        (uuid_generate_v4(), 'Racing Club', 'Union', '2026-02-01 21:30:00+00', v_comp_id, 'Fecha 2')
      ON CONFLICT DO NOTHING;

  END IF;

END $$;
