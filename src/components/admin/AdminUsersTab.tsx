
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { UserPlus } from 'lucide-react';

// 管理ユーザー一覧
interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

// サインアップユーザー一覧
interface UserAccount {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_confirmed: boolean;
}

export const AdminUsersTab = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [accountUsers, setAccountUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'super_admin'>('admin');

  // 管理テーブル表示
  const loadAdminUsers = async () => {
    try {
      const res = await fetch('/rest/v1/admin_users?select=*', { headers: { apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eXVtemxldmxjeHNudmJ0Y3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzA2NjYsImV4cCI6MjA2NTQ0NjY2Nn0.UsQ_zUjFSvdi8fTNIH4p2U8IxWqrsc7Hlic5qB3hetE" } });
      const data = await res.json();
      setAdminUsers(data || []);
    } catch (error) {
      toast({ title: "管理者ユーザーの取得に失敗", variant: "destructive" });
    }
  };

  // ユーザー本体一覧
  const loadAccountUsers = async () => {
    try {
      // 最新のセッション取得
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      if (!jwt) throw new Error("未認証またはセッションが失効しています");

      const res = await fetch("https://huyumzlevlcxsnvbtcsd.supabase.co/functions/v1/list-users", {
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      });
      const result = await res.json();
      if (result?.users) {
        setAccountUsers(result.users);
      } else {
        throw new Error(result?.error || "サーバーエラー");
      }
    } catch (error: any) {
      toast({ title: "ユーザー一覧取得に失敗", description: error?.message, variant: "destructive" });
    }
  };

  // ユーザー削除
  const deleteAccountUser = async (user_id: string) => {
    try {
      const session = JSON.parse(localStorage.getItem("supabase-auth-token") || "{}");
      const jwt = session?.currentSession?.access_token || session?.access_token;
      const res = await fetch("https://huyumzlevlcxsnvbtcsd.supabase.co/functions/v1/delete-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id }),
      });
      const result = await res.json();
      if (result?.success) {
        toast({ title: "ユーザーを削除しました" });
        setAccountUsers(users => users.filter(u => u.id !== user_id));
      } else {
        throw new Error(result?.error || "削除に失敗しました");
      }
    } catch (error: any) {
      toast({ title: "ユーザー削除に失敗", description: error?.message, variant: "destructive" });
    }
  };

  const addAdminUser = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "メールアドレスを入力してください",
        variant: "destructive",
      });
      return;
    }

    try {
      // Note: This is a simplified version. In a real app, you'd need to:
      // 1. Find the user by email from auth.users
      // 2. Add them to admin_users table
      toast({
        title: "機能未実装",
        description: "この機能は開発中です。直接データベースで管理者を追加してください。",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Failed to add admin user:', error);
      toast({
        title: "管理者ユーザーの追加に失敗しました",
        variant: "destructive",
      });
    }
  };

  const removeAdminUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdminUsers(prev => prev.filter(user => user.id !== id));
      toast({
        title: "管理者ユーザーを削除しました",
      });
    } catch (error) {
      console.error('Failed to remove admin user:', error);
      toast({
        title: "管理者ユーザーの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadAdminUsers(), loadAccountUsers()]).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 管理ユーザーリスト（既存のものそのまま） */}
      <Card>
        <CardHeader>
          <CardTitle>管理テーブル</CardTitle>
          <CardDescription>admin_users テーブル</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user_email">ユーザーのメールアドレス</Label>
            <Input
              id="user_email"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="user_role">権限レベル</Label>
            <Select value={newUserRole} onValueChange={(value: 'admin' | 'super_admin') => setNewUserRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="super_admin">スーパー管理者</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addAdminUser} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            管理者ユーザーを追加
          </Button>
        </CardContent>
      </Card>
      
      {/* サインアップユーザー一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>システム全ユーザー</CardTitle>
          <CardDescription>メールアドレスで登録された全ユーザーを一覧できます。（管理者のみ）</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザーID</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead>最終ログイン</TableHead>
                <TableHead>確認済</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('ja-JP')}</TableCell>
                  <TableCell>{user.last_sign_in_at ? (new Date(user.last_sign_in_at).toLocaleString("ja-JP")) : "-"}</TableCell>
                  <TableCell>
                    {user.is_confirmed ? (
                      <span className="text-xs text-green-600">✔</span>
                    ) : (
                      <span className="text-xs text-red-500">✖</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAccountUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
