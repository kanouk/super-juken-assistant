
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { AdminUser } from "./useAdminUsers"

type Props = {
  adminUsers: AdminUser[]
  onDelete: (id: string) => void
}
export function AdminUserTable({ adminUsers, onDelete }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>管理テーブル</CardTitle>
        <CardDescription>admin_users テーブル</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>user_id</TableHead>
              <TableHead>権限</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString("ja-JP") : "-"}
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
