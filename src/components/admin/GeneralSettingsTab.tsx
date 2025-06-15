
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GeneralSettingsTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

export const GeneralSettingsTab = ({ settings, updateSetting }: GeneralSettingsTabProps) => {
  return (
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
  );
};
