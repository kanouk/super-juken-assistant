
-- プロファイルテーブル: ユーザーの追加情報を格納
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  passcode TEXT NOT NULL DEFAULT '453759',
  PRIMARY KEY (id)
);

-- 設定テーブル: ユーザーごとの設定
CREATE TABLE public.settings (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_keys JSONB DEFAULT '{}',
  models JSONB DEFAULT '{"openai": "gpt-4o", "google": "gemini-1.5-pro", "anthropic": "claude-3-sonnet"}',
  common_instruction TEXT DEFAULT 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。',
  subject_instructions JSONB DEFAULT '{"math": "数学の問題は段階的に解法を示し、公式の説明も含めてください。", "english": "英語の文法や単語について、例文を交えて説明してください。", "science": "理科の概念は図表を用いて視覚的に説明してください。", "social": "社会科の内容は歴史的背景や因果関係を重視して説明してください。", "physics": "物理の問題は公式の導出過程も含めて説明してください。", "history": "歴史の出来事は時代背景と関連付けて説明してください。"}',
  PRIMARY KEY (id)
);

-- 会話テーブル: 教科ごとのチャットスレッド
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- メッセージテーブル: チャットメッセージ
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  cost FLOAT8 DEFAULT 0,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- RLS (Row Level Security) を有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- プロファイルテーブルのRLSポリシー
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 設定テーブルのRLSポリシー
CREATE POLICY "Users can view their own settings" 
  ON public.settings 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" 
  ON public.settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own settings" 
  ON public.settings 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 会話テーブルのRLSポリシー
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- メッセージテーブルのRLSポリシー
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- ユーザー登録時にプロファイルと設定を自動作成するトリガー
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  INSERT INTO public.settings (id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- メッセージ画像用のストレージバケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-images', 'message-images', true);

-- ストレージバケットのRLSポリシー（パブリック読み取り、認証ユーザーのみアップロード）
CREATE POLICY "Public can view message images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'message-images');

CREATE POLICY "Authenticated users can upload message images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'message-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own message images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'message-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own message images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'message-images' AND auth.uid()::text = (storage.foldername(name))[1]);
