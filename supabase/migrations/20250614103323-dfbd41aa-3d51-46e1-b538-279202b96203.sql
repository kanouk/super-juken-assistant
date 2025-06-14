
-- Add subject_configs column to the settings table
ALTER TABLE public.settings 
ADD COLUMN subject_configs jsonb DEFAULT '[
  {"id": "math", "name": "数学", "visible": true, "order": 1, "instruction": "数学の問題は段階的に解法を示し、公式の説明も含めてください。LaTeX記法を使って数式を美しく表示してください。"},
  {"id": "chemistry", "name": "化学", "visible": true, "order": 2, "instruction": "化学の概念は化学式や反応式を含めて説明してください。LaTeX記法を使って化学式を正確に表示してください。"},
  {"id": "biology", "name": "生物", "visible": true, "order": 3, "instruction": "生物の概念は図表を用いて視覚的に説明してください。専門用語は分かりやすく解説してください。"},
  {"id": "english", "name": "英語", "visible": true, "order": 4, "instruction": "英語の文法や単語について、例文を交えて説明してください。発音記号も適宜使用してください。"},
  {"id": "japanese", "name": "国語", "visible": true, "order": 5, "instruction": "国語の内容は古文・漢文も含めて丁寧に説明してください。語彙や文法事項を重視してください。"},
  {"id": "geography", "name": "地理", "visible": true, "order": 6, "instruction": "地理の内容は地図や統計データを参考に説明してください。地域性や環境要因も考慮してください。"},
  {"id": "information", "name": "情報", "visible": true, "order": 7, "instruction": "情報の内容はプログラミングやデータ処理について具体例を交えて説明してください。"},
  {"id": "other", "name": "全般", "visible": true, "order": 8, "instruction": "その他の教科についても基礎から応用まで幅広く対応します。具体例を交えて分かりやすく説明してください。"}
]'::jsonb;
