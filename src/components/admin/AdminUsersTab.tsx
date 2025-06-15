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
import { AdminAddUserForm } from "./AdminAddUserForm"
import { AdminUserTable } from "./AdminUserTable"
import { AllAccountUserTable } from "./AllAccountUserTable"
import { useAdminUsers } from "./useAdminUsers"

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
  const {
    adminUsers,
    accountUsers,
    loading,
    deleteAccountUser,
    addAdminUser,
    removeAdminUser
  } = useAdminUsers()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 管理ユーザー追加 */}
      <AdminAddUserForm onAdd={addAdminUser} />
      {/* 管理ユーザーリスト */}
      <AdminUserTable adminUsers={adminUsers} onDelete={removeAdminUser} />
      {/* サインアップユーザー一覧 */}
      <AllAccountUserTable accountUsers={accountUsers} onDelete={deleteAccountUser} />
    </div>
  )
}
