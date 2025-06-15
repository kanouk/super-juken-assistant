
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"

type Props = {
  onAdd: (email: string, role: "admin" | "super_admin") => Promise<boolean>
}
export function AdminAddUserForm({ onAdd }: Props) {
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<"admin" | "super_admin">("admin")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    await onAdd(newUserEmail, newUserRole)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
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
        <Select value={newUserRole} onValueChange={(v: "admin" | "super_admin") => setNewUserRole(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">管理者</SelectItem>
            <SelectItem value="super_admin">スーパー管理者</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAdd} className="w-full" disabled={loading}>
        <UserPlus className="h-4 w-4 mr-2" />
        管理者ユーザーを追加
      </Button>
    </div>
  )
}
