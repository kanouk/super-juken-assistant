
-- admin_settingsテーブルに全ユーザーがSELECT可能なポリシーを追加
-- これにより、一般ユーザーも管理者が設定した無料用APIキーを参照できるようになります
CREATE POLICY "Anyone can read admin settings" 
  ON public.admin_settings 
  FOR SELECT 
  USING (true);
