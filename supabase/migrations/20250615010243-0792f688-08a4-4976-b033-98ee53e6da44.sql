
-- conversations テーブルに is_understood カラムを追加
ALTER TABLE public.conversations 
ADD COLUMN is_understood boolean DEFAULT false;
