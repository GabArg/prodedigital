-- Add new columns for profile completion
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS favorite_team TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Ensure nickname is unique if necessary (optional based on requirements, "visible en rankings" suggests uniqueness might be desired but "distinto del username" is the only constraint mentioned. Let's start without unique constraint to avoid friction unless needed, actually "Apodo" usually implies uniqueness in gaming but requirements didn't explicitly strict unique index. Let's keep it simple for now as requested "visible en rankings").
-- Actually, for consistency in rankings, nickname uniqueness is good practice. I will add it as a constraint if it makes sense, but the prompt says "string" and "distinto del username". I'll stick to basic columns first.

-- Update existing users to have profile_completed = true IF they already have data (optional, but for new flow default is false). 
-- Since we are introducing this flow now, existing users might not have this data.
-- The requirement says: "auto-login -> redirigir a /complete-profile". 
-- Existing users might want to keep playing. If we default to false, EVERYONE will be forced to complete profile. This seems to be the intent "Este paso es necesario...".

-- Policy updates if needed (assuming users can update their own profile)
-- Existing policies likely cover "UPDATE" for "auth.uid() = id".
