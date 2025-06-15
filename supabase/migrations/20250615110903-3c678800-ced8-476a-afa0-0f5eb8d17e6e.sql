
-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Admin users can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin_users" ON public.admin_users;

-- 必要ならis_super_admin関数の更新も（エラーが出なければ問題なし）
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 管理者ユーザーなら参照許可
CREATE POLICY "Admin users can view admin users"
ON public.admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  )
);

-- super_adminだけ追加・編集・削除許可
CREATE POLICY "Super admin can manage admin_users"
ON public.admin_users
FOR ALL
USING (
  public.is_super_admin()
);
