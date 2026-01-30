-- Chat Messages Table
CREATE TABLE IF NOT EXISTS public.friend_tournament_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id uuid REFERENCES public.friend_tournaments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) > 0),
    created_at timestamptz DEFAULT now()
);

-- Policies
ALTER TABLE public.friend_tournament_messages ENABLE ROW LEVEL SECURITY;

-- View: Members can see messages
CREATE POLICY "Members can view messages" ON public.friend_tournament_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.friend_tournament_members 
        WHERE tournament_id = friend_tournament_messages.tournament_id 
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

-- Insert: Members can insert messages
CREATE POLICY "Members can send messages" ON public.friend_tournament_messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.friend_tournament_members 
        WHERE tournament_id = friend_tournament_messages.tournament_id 
        AND user_id = auth.uid()
        AND status = 'active'
    )
);
