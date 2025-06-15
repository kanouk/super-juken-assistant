
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelsSettingsTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

export const ModelsSettingsTab = ({ settings, updateSetting }: ModelsSettingsTabProps) => {
  const handleFreeModelChange = (provider: string, value: string) => {
    updateSetting('free_user_models', {
      ...settings.free_user_models,
      [provider]: value
    });
  };

  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'google', name: 'Google Gemini' },
    { id: 'anthropic', name: 'Anthropic' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>無料ユーザー用デフォルトモデル</CardTitle>
          <CardDescription>無料ユーザーが使用するデフォルトのモデルを設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <div key={provider.id}>
              <Label htmlFor={`free_model_${provider.id}`}>{provider.name}</Label>
              <Select
                value={settings.free_user_models?.[provider.id] || ''}
                onValueChange={(value) => handleFreeModelChange(provider.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`${provider.name}のモデルを選択...`} />
                </SelectTrigger>
                <SelectContent>
                  {settings.available_models?.[provider.id]?.map((model: any) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>利用可能モデル一覧</CardTitle>
          <CardDescription>ユーザー設定画面に表示されるモデル一覧（読み取り専用）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <div key={provider.id}>
              <Label>{provider.name}</Label>
              <div className="mt-2 space-y-1">
                {settings.available_models?.[provider.id]?.map((model: any) => (
                  <div key={model.value} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {model.label} ({model.value})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
