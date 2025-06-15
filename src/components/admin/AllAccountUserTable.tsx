
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { UserAccount } from "./useAdminUsers"

type Props = {
  accountUsers: UserAccount[]
  onDelete: (id: string) => void
}
export function AllAccountUserTable({ accountUsers, onDelete }: Props) {
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
