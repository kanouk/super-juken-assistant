
-- Add the selected_provider column to the settings table
ALTER TABLE public.settings 
ADD COLUMN selected_provider text DEFAULT 'openai';
