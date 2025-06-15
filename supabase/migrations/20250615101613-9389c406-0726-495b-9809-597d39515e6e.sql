
-- RLSを有効化
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 管理者ユーザー（=admin_usersに行があるユーザー）は自分を参照できる
CREATE POLICY "Admin users can view their own admin_users row"
  ON public.admin_users
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- スーパー管理者のみ追加・編集・削除できる（適宜roleに応じて調整）
CREATE POLICY "Super admin can manage admin_users"
  ON public.admin_users
  FOR ALL
  USING (
    user_id = auth.uid() AND role = 'super_admin'
  );
