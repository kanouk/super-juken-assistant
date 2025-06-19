
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserAccount {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_confirmed: boolean;
  plan?: string | null;
  points?: number | null;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Supabase Edgeファンクション経由でユーザーリストを取得
      const { data, error } = await supabase.functions.invoke('list-users');
      
      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "ユーザー一覧の取得に失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // auth.usersのデータとprofilesのプラン情報を結合
      const usersWithPlanInfo = await Promise.all(
        data.users.map(async (user: any) => {
          // profilesテーブルからプラン情報を取得
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan, points')
            .eq('id', user.id)
            .single();

          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            is_confirmed: user.email_confirmed_at !== null,
            plan: profile?.plan || 'free',
            points: profile?.points || 0,
          };
        })
      );
      
      setUsers(usersWithPlanInfo);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "エラーが発生しました",
        description: "ユーザー一覧の取得中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin users:', error);
        return;
      }

      setAdminUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "ユーザー削除に失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "ユーザーが削除されました",
        description: "ユーザーアカウントが正常に削除されました。",
      });

      // ユーザーリストを再取得
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: "エラーが発生しました",
        description: "ユーザー削除中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const deleteAdminUser = async (adminUserId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminUserId);

      if (error) {
        console.error('Error deleting admin user:', error);
        toast({
          title: "管理者削除に失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "管理者が削除されました",
        description: "管理者が正常に削除されました。",
      });

      fetchAdminUsers();
    } catch (error) {
      console.error('Failed to delete admin user:', error);
      toast({
        title: "エラーが発生しました",
        description: "管理者削除中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const addAdminUser = async (userId: string, role: string) => {
    try {
      // Ensure role is properly typed
      const validRole = role as 'admin' | 'super_admin';
      
      const { error } = await supabase
        .from('admin_users')
        .insert([{ user_id: userId, role: validRole }]);

      if (error) {
        console.error('Error adding admin user:', error);
        toast({
          title: "管理者追加に失敗しました",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "管理者が追加されました",
        description: "新しい管理者が正常に追加されました。",
      });

      fetchAdminUsers();
    } catch (error) {
      console.error('Failed to add admin user:', error);
      toast({
        title: "エラーが発生しました",
        description: "管理者追加中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdminUsers();
  }, []);

  return {
    users,
    adminUsers,
    isLoading,
    deleteUser,
    deleteAdminUser,
    addAdminUser,
    refreshUsers: fetchUsers,
    refreshAdminUsers: fetchAdminUsers,
  };
};
