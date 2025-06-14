
-- プロフィールテーブルに新しいフィールドを追加
ALTER TABLE public.profiles 
ADD COLUMN display_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN avatar_url TEXT,
ADD COLUMN show_countdown BOOLEAN DEFAULT true,
ADD COLUMN exam_settings JSONB DEFAULT '{"kyotsu": {"name": "共通テスト", "date": "2026-01-17"}, "todai": {"name": "東大二次試験", "date": "2026-02-25"}}'::jsonb;

-- settingsテーブルのsubject_instructionsを充実させる
UPDATE public.settings 
SET subject_instructions = '{
  "math": "数学の問題は段階的に解法を示し、公式の説明も含めてください。図解を活用し、計算過程を明示して理解しやすく説明してください。",
  "chemistry": "化学の内容は反応機構、化学式、実験手順を詳しく説明し、安全性についても言及してください。分子レベルでの理解を促進してください。",
  "biology": "生物学の概念は図表を活用して視覚的に説明し、生命現象の関連性や実例との結びつけを重視してください。",
  "english": "英語の文法や単語について、豊富な例文を交えて説明し、語源や実用的な表現も含めてください。",
  "japanese": "国語の内容は文章構造を分析し、古典文法や背景知識、表現技法について詳しく説明してください。",
  "geography": "地理の学習では地図や統計データを活用し、地域特性や環境問題との関連も説明してください。",
  "information": "情報科目ではアルゴリズムの説明にコード例を含め、実装手順や応用例も示してください。",
  "other": "分野横断的な思考を促し、応用力向上のため関連分野との結びつけを重視してください。"
}'::jsonb;
