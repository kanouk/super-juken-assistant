
-- 管理者設定に第1ゴールの設定を追加
INSERT INTO admin_settings (setting_key, setting_value, description) 
VALUES (
  'default_first_goal',
  '{"name": "共通テスト", "date": "2026-01-17"}',
  '新規ユーザーの第1ゴールのデフォルト設定'
) ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- プロフィールテーブルに統計表示設定を追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_stats boolean DEFAULT true;
