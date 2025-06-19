
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Coins, Crown, Gift } from "lucide-react"
import type { UserAccount } from "./useAdminUsers"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

type Props = {
  accountUsers: UserAccount[]
  onDelete: (id: string) => void
  onRefresh?: () => void
}

const PLAN_CONFIG = {
  free: { 
    label: '無料', 
    color: 'bg-gray-100 text-gray-800',
    icon: Gift
  },
  one_time: { 
    label: '買い切り', 
    color: 'bg-blue-100 text-blue-800',
    icon: Coins
  },
  premium: { 
    label: 'プレミアム', 
    color: 'bg-purple-100 text-purple-800',
    icon: Crown
  }
}

export function AllAccountUserTable({ accountUsers, onDelete, onRefresh }: Props) {
  const { toast } = useToast()

  const handlePlanChange = async (userId: string, newPlan: string) => {
    try {
      console.log(`Updating user ${userId} plan to ${newPlan}`)
      
      const { error } = await supabase
        .from('profiles')
        .update({ plan: newPlan })
        .eq('id', userId)

      if (error) {
        console.error('Plan update error:', error)
        toast({
          title: "プラン変更に失敗しました",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "プランが変更されました",
        description: `ユーザーのプランが${PLAN_CONFIG[newPlan as keyof typeof PLAN_CONFIG].label}に変更されました。`,
      })

      // データを再読み込み
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to update user plan:', error)
      toast({
        title: "エラーが発生しました",
        description: "プランの変更中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  const getPlanBadge = (plan: string | null, points: number | null) => {
    const planKey = plan as keyof typeof PLAN_CONFIG || 'free'
    const config = PLAN_CONFIG[planKey]
    const IconComponent = config.icon

    return (
      <div className="flex items-center gap-2">
        <Badge className={config.color}>
          <IconComponent className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
        <Badge variant="outline" className="text-xs">
          <Coins className="h-3 w-3 mr-1 text-amber-600" />
          {points || 0}pt
        </Badge>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>システム全ユーザー</CardTitle>
        <CardDescription>
          メールアドレスで登録された全ユーザーを一覧できます。（管理者のみ）
        </CardDescription>
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
              <TableHead>プラン・ポイント</TableHead>
              <TableHead>プラン変更</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString("ja-JP")}</TableCell>
                <TableCell>
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString("ja-JP")
                    : "-"}
                </TableCell>
                <TableCell>
                  {user.is_confirmed ? (
                    <span className="text-xs text-green-600">✔</span>
                  ) : (
                    <span className="text-xs text-red-500">✖</span>
                  )}
                </TableCell>
                <TableCell>
                  {getPlanBadge(user.plan, user.points)}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.plan || 'free'}
                    onValueChange={(value) => handlePlanChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">無料</SelectItem>
                      <SelectItem value="one_time">買い切り</SelectItem>
                      <SelectItem value="premium">プレミアム</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user.id)}
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
  )
}
