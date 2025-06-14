
-- conversationsテーブルにタイトルカラムを追加
ALTER TABLE public.conversations 
ADD COLUMN title TEXT;

-- 既存の会話にデフォルトタイトルを設定
UPDATE public.conversations 
SET title = CASE 
  WHEN subject = 'math' THEN '数学の質問'
  WHEN subject = 'chemistry' THEN '化学の質問'
  WHEN subject = 'biology' THEN '生物の質問'
  WHEN subject = 'english' THEN '英語の質問'
  WHEN subject = 'japanese' THEN '国語の質問'
  WHEN subject = 'geography' THEN '地理の質問'
  WHEN subject = 'information' THEN '情報の質問'
  ELSE 'その他の質問'
END || ' - ' || to_char(created_at, 'MM/DD HH24:MI')
WHERE title IS NULL;

-- 新しい会話にはデフォルトでタイトルを設定
ALTER TABLE public.conversations 
ALTER COLUMN title SET NOT NULL;
