
-- 既存の問題のあるポリシーを削除
DROP POLICY IF EXISTS "Admin users can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON public.admin_users;

-- セキュリティ定義関数を作成（無限再帰を防ぐため）
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 新しいポリシーを作成（無限再帰を防ぐ）
CREATE POLICY "Admin users can view admin users"
ON public.admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  )
);

-- スーパー管理者のみが管理できるポリシー
CREATE POLICY "Super admin can manage admin users"
ON public.admin_users
FOR ALL
USING (
  public.is_super_admin()
);
