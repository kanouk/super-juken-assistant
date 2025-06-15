
-- セキュリティ修正: 既存ユーザーの管理者APIキーをクリア
-- 管理者以外のユーザーのAPIキーを空にする
UPDATE public.settings 
SET api_keys = '{}'::jsonb 
WHERE id NOT IN (
  SELECT user_id FROM public.admin_users WHERE role = 'super_admin'
)
AND api_keys IS NOT NULL 
AND api_keys != '{}'::jsonb;
