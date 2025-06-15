
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ApiKeysTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

export const ApiKeysTab = ({ settings, updateSetting }: ApiKeysTabProps) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleApiKeyChange = (provider: string, value: string) => {
    updateSetting('free_user_api_keys', {
      ...settings.free_user_api_keys,
      [provider]: value
    });
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const providers = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4などのOpenAIモデル用' },
    { id: 'google', name: 'Google Gemini', description: 'Geminiモデル用' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claudeモデル用' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>無料ユーザー用APIキー</CardTitle>
        <CardDescription>無料ユーザーが使用するデフォルトのAPIキーを設定します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {providers.map((provider) => (
          <div key={provider.id} className="space-y-2">
            <Label htmlFor={`api_key_${provider.id}`}>
              {provider.name}
            </Label>
            <p className="text-sm text-gray-600">{provider.description}</p>
            <div className="flex space-x-2">
              <Input
                id={`api_key_${provider.id}`}
                type={showKeys[provider.id] ? 'text' : 'password'}
                value={settings.free_user_api_keys?.[provider.id] || ''}
                onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                placeholder={`${provider.name} APIキーを入力...`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey(provider.id)}
              >
                {showKeys[provider.id] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
