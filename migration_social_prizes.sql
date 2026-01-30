-- 1. Add Public/Private flag and Prizes to Tournaments
ALTER TABLE public.friend_tournaments 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

ALTER TABLE public.friend_tournaments 
ADD COLUMN IF NOT EXISTS prizes_info jsonb DEFAULT '{}'::jsonb;

-- 2. Add Status to Members (active, pending, rejected)
ALTER TABLE public.friend_tournament_members 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected'));

-- 3. Policy Updates (Allow inserting 'pending' members if private)
-- (Existing policy allows insert if auth.uid() = user_id, which covers joining)
-- We might need a policy for "Approve" (Update status where auth.uid() = owner)

CREATE POLICY "Owner can manage members" ON public.friend_tournament_members 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.friend_tournaments 
        WHERE id = friend_tournament_members.tournament_id 
        AND owner_user_id = auth.uid()
    )
);

-- Policy: Everyone can see public groups (for search directory later)
-- Existing policy "Everyone can view tournaments" covers this.
