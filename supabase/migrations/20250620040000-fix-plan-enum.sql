
-- Fix plan enum to include 'premium_monthly' instead of 'premium'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('free', 'one_time', 'premium_monthly'));

-- Update any existing 'premium' values to 'premium_monthly'
UPDATE public.profiles 
SET plan = 'premium_monthly' 
WHERE plan = 'premium';
