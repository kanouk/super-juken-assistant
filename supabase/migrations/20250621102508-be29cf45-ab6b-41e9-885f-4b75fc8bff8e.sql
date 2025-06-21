
-- Create learning_streaks table for tracking user learning streaks
CREATE TABLE public.learning_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on learning_streaks table
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_streaks
CREATE POLICY "Users can view their own learning streaks" 
  ON public.learning_streaks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning streaks" 
  ON public.learning_streaks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning streaks" 
  ON public.learning_streaks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_learning_streaks_user_id ON public.learning_streaks(user_id);
CREATE INDEX idx_learning_streaks_last_activity ON public.learning_streaks(last_activity_date);

-- Add trigger to update updated_at column
CREATE TRIGGER update_learning_streaks_updated_at
  BEFORE UPDATE ON public.learning_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
