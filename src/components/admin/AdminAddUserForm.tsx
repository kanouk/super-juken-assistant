
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
  onAdd: (userId: string, role: string) => void;
  onRefresh: () => void;
};

export const AdminAddUserForm = ({ onAdd, onRefresh }: Props) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      onAdd(userId.trim(), role);
      setUserId('');
      setRole('admin');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>管理者追加</CardTitle>
        <CardDescription>
          新しい管理者を追加します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">ユーザーID</Label>
            <Input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="ユーザーIDを入力"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">権限</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="super_admin">スーパー管理者</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">追加</Button>
        </form>
      </CardContent>
    </Card>
  );
};
