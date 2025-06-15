
-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Admin users can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can read admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admin users can access admin settings" ON public.admin_settings;

-- admin_settingsテーブルのRLSを一時的に無効化
ALTER TABLE public.admin_settings DISABLE ROW LEVEL SECURITY;

-- admin_usersテーブル用のセキュリティ定義関数を作成
CREATE OR REPLACE FUNCTION public.check_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- スーパー管理者チェック関数を作成
CREATE OR REPLACE FUNCTION public.check_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- admin_usersテーブルに新しいポリシーを適用
CREATE POLICY "Authenticated users can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.check_admin_user());

CREATE POLICY "Super admins can manage admin users"
ON public.admin_users
FOR ALL
TO authenticated
USING (public.check_super_admin());

-- admin_settingsを誰でもアクセス可能にする（無料APIキー取得のため）
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read admin settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify admin settings"
ON public.admin_settings
FOR ALL
TO authenticated
USING (public.check_admin_user());
