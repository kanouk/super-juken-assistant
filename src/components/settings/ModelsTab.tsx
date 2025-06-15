
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain } from "lucide-react";

interface ModelsTabProps {
  models: {
    openai: string;
    google: string;
    anthropic: string;
  };
  selectedProvider: string;
  updateSetting: (path: string, value: any) => void;
  availableModels?: Record<string, { label: string; value: string }[]>;
  freeUserModels?: Record<string, string>;
  apiKeys?: { openai?: string; google?: string; anthropic?: string }
}

export const ModelsTab = ({
  models,
  selectedProvider,
  updateSetting,
  availableModels,
  freeUserModels,
  apiKeys
}: ModelsTabProps) => {
  // APIキーが空なら管理者指定モデルのみ可
  const userKeys = {
    openai: !!apiKeys?.openai,
    google: !!apiKeys?.google,
    anthropic: !!apiKeys?.anthropic
  };

  const keySet = userKeys.openai || userKeys.google || userKeys.anthropic;

  // デフォルト選択肢
  const getAllowedModels = (provider: string) => {
    if (userKeys[provider as keyof typeof userKeys]) {
      return availableModels?.[provider] ?? [];
    }
    // ユーザーAPI未登録時は管理者指定デフォルトのみ
    if (freeUserModels?.[provider] && availableModels?.[provider]) {
      return availableModels[provider].filter(
        m => m.value === freeUserModels[provider]
      );
    }
    return [];
  };

  // プレースホルダー用: 管理者指定モデル名 or 通常値
  const getModelPlaceholder = (provider: string) => {
    if (!userKeys[provider as keyof typeof userKeys] && freeUserModels?.[provider]) {
      // 管理者指定モデル（無料ユーザー用デフォルト）
      const found = availableModels?.[provider]?.find(m => m.value === freeUserModels[provider]);
      return found ? `（無料設定モデル: ${found.label}）` : "無料設定モデル";
    }
    return "モデルを選択";
  };

  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100">
        <CardTitle className="flex items-center text-xl">
          <Brain className="h-6 w-6 mr-3 text-purple-600" />
          AIモデル設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {!keySet && (
          <div className="text-xs text-gray-700 bg-purple-50 border border-purple-200 rounded px-3 py-2 mb-2">
            ※ 管理者が指定したデフォルトモデルのみ利用できます。他のモデルを利用したい場合はAPIキーを登録してください。
          </div>
        )}
        <div>
          <Label className="text-base font-semibold mb-4 block">使用するプロバイダー</Label>
          <RadioGroup
            value={selectedProvider}
            onValueChange={(value) => updateSetting('selectedProvider', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="font-medium">OpenAI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="google" id="google" />
              <Label htmlFor="google" className="font-medium">Google (Gemini)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="anthropic" id="anthropic" />
              <Label htmlFor="anthropic" className="font-medium">Anthropic (Claude)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t pt-6">
          <Label className="text-base font-semibold mb-4 block">選択可能なモデル</Label>

          <div className="space-y-4">
            {["openai", "google", "anthropic"].map(provider => (
              <div key={provider}>
                <Label>
                  {provider === "openai"
                    ? "OpenAI モデル"
                    : provider === "google"
                      ? "Google Gemini モデル"
                      : "Anthropic Claude モデル"}
                </Label>
                <Select
                  value={models[provider as keyof typeof models] || ""}
                  onValueChange={(value) =>
                    updateSetting(`models.${provider}`, value)
                  }
                  disabled={!userKeys[provider as keyof typeof userKeys]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getModelPlaceholder(provider)} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllowedModels(provider).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
