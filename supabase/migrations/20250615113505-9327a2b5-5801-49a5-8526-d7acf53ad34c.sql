
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS mbti_instructions jsonb;
