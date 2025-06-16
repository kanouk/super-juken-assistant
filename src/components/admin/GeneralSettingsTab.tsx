
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GeneralSettingsTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

export const GeneralSettingsTab = ({ settings, updateSetting }: GeneralSettingsTabProps) => {
  const handleFirstGoalChange = (field: 'name' | 'date', value: string) => {
    const currentGoal = settings.default_first_goal || { name: '共通テスト', date: '2026-01-17' };
    updateSetting('default_first_goal', {
      ...currentGoal,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>全般設定</CardTitle>
          <CardDescription>サービス全体で使用する基本設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="default_pin">デフォルトPIN番号</Label>
            <Input
              id="default_pin"
              value={settings.default_pin || ''}
              onChange={(e) => updateSetting('default_pin', e.target.value)}
              placeholder="999999"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>第1ゴール設定</CardTitle>
          <CardDescription>新規ユーザーのデフォルト第1ゴール（共通テスト等）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="first_goal_name">第1ゴール名</Label>
            <Input
              id="first_goal_name"
              value={settings.default_first_goal?.name || '共通テスト'}
              onChange={(e) => handleFirstGoalChange('name', e.target.value)}
              placeholder="共通テスト"
            />
          </div>
          <div>
            <Label htmlFor="first_goal_date">第1ゴール日付</Label>
            <Input
              id="first_goal_date"
              type="date"
              value={settings.default_first_goal?.date || '2026-01-17'}
              onChange={(e) => handleFirstGoalChange('date', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
