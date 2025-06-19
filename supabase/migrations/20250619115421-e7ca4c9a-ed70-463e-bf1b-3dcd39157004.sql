
-- Add billing-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN plan text DEFAULT 'free' CHECK (plan IN ('free', 'one_time', 'premium')),
ADD COLUMN stripe_customer_id text,
ADD COLUMN points integer DEFAULT 10;

-- Insert default model costs setting into admin_settings
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES (
  'default_model_costs',
  '{"gpt-4o-mini": 1, "gpt-4o": 5, "claude-3-5-sonnet": 3}'::jsonb,
  'モデルごとの消費ポイント設定'
)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = now();
