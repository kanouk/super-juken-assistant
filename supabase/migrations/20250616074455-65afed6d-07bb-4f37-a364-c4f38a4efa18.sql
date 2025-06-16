
-- 質問とタグの関連付けテーブルを作成
CREATE TABLE public.question_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tag_master(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assignment_method TEXT NOT NULL DEFAULT 'auto' CHECK (assignment_method IN ('auto', 'manual')),
  UNIQUE(conversation_id, tag_id)
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_question_tags_conversation_id ON public.question_tags(conversation_id);
CREATE INDEX idx_question_tags_tag_id ON public.question_tags(tag_id);

-- Row Level Security を有効化
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の質問のタグのみ閲覧可能
CREATE POLICY "Users can view their own question tags"
  ON public.question_tags
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

-- 管理者のみがタグの追加・更新・削除が可能
CREATE POLICY "Admins can manage question tags"
  ON public.question_tags
  FOR ALL
  USING (check_admin_user());
