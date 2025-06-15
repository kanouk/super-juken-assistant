
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus } from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export const AdminUsersTab = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'super_admin'>('admin');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Failed to load admin users:', error);
      toast({
        title: "管理者ユーザーの読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    loadAdminUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新しい管理者ユーザーを追加</CardTitle>
          <CardDescription>管理者権限を持つユーザーを追加します</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>現在の管理者ユーザー</CardTitle>
          <CardDescription>管理者権限を持つユーザーの一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザーID</TableHead>
                <TableHead>権限レベル</TableHead>
                <TableHead>追加日時</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'super_admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'super_admin' ? 'スーパー管理者' : '管理者'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('ja-JP')}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAdminUser(user.id)}
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
