
-- conversationsテーブルに理解した日時を記録するカラムを追加
ALTER TABLE public.conversations 
ADD COLUMN understood_at TIMESTAMP WITH TIME ZONE;

-- 既存の理解済みレコードについて、understood_atをcreated_atと同じ値で初期化
-- （実際の理解日時は不明なため、作成日時で代替）
UPDATE public.conversations 
SET understood_at = created_at 
WHERE is_understood = true AND understood_at IS NULL;
