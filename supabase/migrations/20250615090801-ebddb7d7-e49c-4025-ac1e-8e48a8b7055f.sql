
-- 管理者設定テーブルを作成
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 初期データを挿入
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('default_pin', '"999999"', 'デフォルトPIN番号'),
('default_common_instruction', '"あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。数学や化学の問題ではLaTeX記法を使って数式を表現してください。"', 'デフォルト全般インストラクション'),
('default_subject_instructions', '{"math": "数学の問題は段階的に解法を示し、公式の説明も含めてください。LaTeX記法を使って数式を美しく表示してください。", "chemistry": "化学の概念は化学式や反応式を含めて説明してください。LaTeX記法を使って化学式を正確に表示してください。", "biology": "生物の概念は図表を用いて視覚的に説明してください。専門用語は分かりやすく解説してください。", "english": "英語の文法や単語について、例文を交えて説明してください。発音記号も適宜使用してください。", "japanese": "国語の内容は古文・漢文も含めて丁寧に説明してください。語彙や文法事項を重視してください。", "physics": "物理の問題は公式や原理を分かりやすく、図や数式を交えて解説してください。", "earth_science": "地学の内容は地球や宇宙、自然現象を具体例と図を用いて説明してください。", "world_history": "世界史の出来事は時代背景や因果関係を重視して説明してください。年号や史実の正確さも心がけてください。", "japanese_history": "日本史の出来事は時代区分とともに流れを重視して説明してください。人物名や文化の背景も補足してください。", "geography": "地理の内容は地図や統計データを参考に説明してください。地域性や環境要因も考慮してください。", "information": "情報の内容はプログラミングやデータ処理について具体例を交えて説明してください。", "other": "その他の教科についても基礎から応用まで幅広く対応します。具体例を交えて分かりやすく説明してください。"}', 'デフォルト教科別インストラクション'),
('free_user_api_keys', '{"openai": "", "google": "", "anthropic": ""}', '無料ユーザー用APIキー'),
('available_models', '{"openai": [{"label": "GPT-4.1 (2025-04-14)", "value": "gpt-4.1-2025-04-14"}, {"label": "O3 (2025-04-16)", "value": "o3-2025-04-16"}, {"label": "O4 Mini (2025-04-16)", "value": "o4-mini-2025-04-16"}, {"label": "GPT-4o（旧モデル）", "value": "gpt-4o"}], "google": [{"label": "Gemini 2.5 Pro", "value": "gemini-2.5-pro"}, {"label": "Gemini 1.5 Pro", "value": "gemini-1.5-pro"}, {"label": "Gemini 1.5 Flash", "value": "gemini-1.5-flash"}], "anthropic": [{"label": "Sonnet 4 (2025-05-14)", "value": "claude-sonnet-4-20250514"}, {"label": "Opus 4 (2025-05-14)", "value": "claude-opus-4-20250514"}, {"label": "3.5 Haiku (2024-10-22)", "value": "claude-3-5-haiku-20241022"}, {"label": "3.7 Sonnet (2025-02-19)", "value": "claude-3-7-sonnet-20250219"}, {"label": "3 Sonnet（旧モデル）", "value": "claude-3-sonnet"}, {"label": "3 Haiku（旧モデル）", "value": "claude-3-haiku"}, {"label": "3 Opus（旧モデル）", "value": "claude-3-opus"}]}', 'ユーザー設定画面に表示するモデル一覧'),
('free_user_models', '{"openai": "gpt-4.1-2025-04-14", "google": "gemini-1.5-pro", "anthropic": "claude-3-5-haiku-20241022"}', '無料ユーザー用デフォルトモデル');

-- RLSを有効にする（管理者のみアクセス可能）
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 管理者ロールを作成
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin');

-- 管理者ユーザーテーブルを作成
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  role admin_role NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 管理者のみ設定にアクセス可能
CREATE POLICY "Only admin users can access admin settings"
  ON public.admin_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- 管理者ユーザーテーブルのRLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view admin users"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin can manage admin users"
  ON public.admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
