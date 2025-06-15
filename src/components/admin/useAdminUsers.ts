
import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface AdminUser {
  id: string
  user_id: string
  role: string
  created_at: string
}
export interface UserAccount {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  is_confirmed: boolean
}

export function useAdminUsers() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [accountUsers, setAccountUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // 管理テーブル表示
  const loadAdminUsers = useCallback(async () => {
    try {
      const res = await fetch('/rest/v1/admin_users?select=*', {
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eXVtemxldmxjeHNudmJ0Y3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzA2NjYsImV4cCI6MjA2NTQ0NjY2Nn0.UsQ_zUjFSvdi8fTNIH4p2U8IxWqrsc7Hlic5qB3hetE",
        },
      })
      const data = await res.json()
      setAdminUsers(data || [])
    } catch {
      toast({ title: "管理者ユーザーの取得に失敗", variant: "destructive" })
    }
  }, [toast])

  // ユーザー本体一覧
  const loadAccountUsers = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const jwt = sessionData?.session?.access_token
      if (!jwt) throw new Error("未認証またはセッションが失効しています")
      const res = await fetch(
        "https://huyumzlevlcxsnvbtcsd.supabase.co/functions/v1/list-users",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      const result = await res.json()
      if (result?.users) {
        setAccountUsers(result.users)
      } else {
        throw new Error(result?.error || "サーバーエラー")
      }
    } catch (error: any) {
      toast({
        title: "ユーザー一覧取得に失敗",
        description: error?.message,
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadAdminUsers(), loadAccountUsers()]).finally(() =>
      setLoading(false)
    )
    // eslint-disable-next-line
  }, [])

  // ユーザー削除
  const deleteAccountUser = async (user_id: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const jwt = sessionData?.session?.access_token
      const res = await fetch(
        "https://huyumzlevlcxsnvbtcsd.supabase.co/functions/v1/delete-user",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id }),
        }
      )
      const result = await res.json()
      if (result?.success) {
        toast({ title: "ユーザーを削除しました" })
        setAccountUsers((users) => users.filter((u) => u.id !== user_id))
        await loadAdminUsers()
      } else {
        throw new Error(result?.error || "削除に失敗しました")
      }
    } catch (error: any) {
      toast({
        title: "ユーザー削除に失敗",
        description: error?.message,
        variant: "destructive",
      })
    }
  }

  // 管理者追加
  const addAdminUser = async (email: string, role: "admin" | "super_admin") => {
    if (!email.trim()) {
      toast({ title: "メールアドレスを入力してください", variant: "destructive" })
      return false
    }
    try {
      toast({
        title: "機能未実装",
        description:
          "この機能は開発中です。直接データベースで管理者を追加してください。",
        variant: "destructive",
      })
      return false
    } catch (error) {
      toast({
        title: "管理者ユーザーの追加に失敗しました",
        variant: "destructive",
      })
      return false
    }
  }

  // 管理者削除
  const removeAdminUser = async (id: string) => {
    try {
      const { error } = await supabase.from("admin_users").delete().eq("id", id)
      if (error) throw error
      setAdminUsers((prev) => prev.filter((user) => user.id !== id))
      toast({ title: "管理者ユーザーを削除しました" })
    } catch {
      toast({
        title: "管理者ユーザーの削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  return {
    adminUsers,
    accountUsers,
    loading,
    loadAdminUsers,
    loadAccountUsers,
    deleteAccountUser,
    addAdminUser,
    removeAdminUser,
  }
}
