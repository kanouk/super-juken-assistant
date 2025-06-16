
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
  // APIキーが設定されているかチェック
  const hasApiKey = {
    openai: !!(apiKeys?.openai?.trim()),
    google: !!(apiKeys?.google?.trim()),
    anthropic: !!(apiKeys?.anthropic?.trim())
  };

  // いずれかのAPIキーが設定されているかどうか
  const hasAnyApiKey = hasApiKey.openai || hasApiKey.google || hasApiKey.anthropic;

  // デフォルトプロバイダーを取得
  const getDefaultProvider = () => {
    if (freeUserModels?.openai) return 'openai';
    if (freeUserModels?.google) return 'google';
    if (freeUserModels?.anthropic) return 'anthropic';
    return 'openai'; // フォールバック
  };

  // 表示用のプロバイダー（APIキーがない場合はデフォルト）
  const displayProvider = hasAnyApiKey ? selectedProvider : getDefaultProvider();

  // プロバイダー変更のハンドラー（APIキーがある場合のみ動作）
  const handleProviderChange = (value: string) => {
    if (hasAnyApiKey) {
      updateSetting('selectedProvider', value);
    }
  };

  // モデル変更のハンドラー（APIキーがある場合のみ動作）
  const handleModelChange = (provider: string, value: string) => {
    if (hasApiKey[provider as keyof typeof hasApiKey]) {
      updateSetting(`models.${provider}`, value);
    }
  };

  // 選択可能なモデル一覧を取得
  const getAvailableModels = (provider: string) => {
    if (hasApiKey[provider as keyof typeof hasApiKey]) {
      return availableModels?.[provider] ?? [];
    }
    // APIキーがない場合はデフォルトモデルのみ
    if (freeUserModels?.[provider] && availableModels?.[provider]) {
      return availableModels[provider].filter(
        m => m.value === freeUserModels[provider]
      );
    }
    return [];
  };

  // モデル表示用の値を取得
  const getDisplayModel = (provider: string) => {
    if (hasApiKey[provider as keyof typeof hasApiKey]) {
      return models[provider as keyof typeof models] || "";
    }
    // APIキーがない場合はデフォルト
    return freeUserModels?.[provider] || "";
  };

  // 利用可能なプロバイダーのリスト（APIキーが設定されたもの + デフォルト）
  const getVisibleProviders = () => {
    if (!hasAnyApiKey) {
      // APIキーがない場合はデフォルトプロバイダーのみ表示
      const defaultProvider = getDefaultProvider();
      const providerNames = {
        openai: 'OpenAI',
        google: 'Google (Gemini)',
        anthropic: 'Anthropic (Claude)'
      };
      return [{
        id: defaultProvider,
        name: providerNames[defaultProvider as keyof typeof providerNames],
        hasKey: false,
        isDefault: true
      }];
    }
    
    // APIキーがある場合は、APIキーが設定されたもの + デフォルトのものを表示
    const providers = [];
    const providerInfo = {
      openai: 'OpenAI',
      google: 'Google (Gemini)',
      anthropic: 'Anthropic (Claude)'
    };
    
    // APIキーが設定されたプロバイダーを追加
    Object.keys(hasApiKey).forEach(providerId => {
      if (hasApiKey[providerId as keyof typeof hasApiKey]) {
        providers.push({
          id: providerId,
          name: providerInfo[providerId as keyof typeof providerInfo],
          hasKey: true,
          isDefault: false
        });
      }
    });
    
    // デフォルトプロバイダーも含める（まだ追加されていない場合）
    const defaultProvider = getDefaultProvider();
    if (!providers.find(p => p.id === defaultProvider)) {
      providers.push({
        id: defaultProvider,
        name: providerInfo[defaultProvider as keyof typeof providerInfo],
        hasKey: false,
        isDefault: true
      });
    }
    
    return providers;
  };

  // 表示すべきモデル設定（APIキーが設定されたもの + デフォルト）
  const getModelProvidersToShow = () => {
    if (!hasAnyApiKey) {
      return [getDefaultProvider()];
    }
    
    const providers = [];
    // APIキーが設定されたプロバイダー
    Object.keys(hasApiKey).forEach(providerId => {
      if (hasApiKey[providerId as keyof typeof hasApiKey]) {
        providers.push(providerId);
      }
    });
    
    // デフォルトプロバイダーも含める（まだ追加されていない場合）
    const defaultProvider = getDefaultProvider();
    if (!providers.includes(defaultProvider)) {
      providers.push(defaultProvider);
    }
    
    return providers;
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
        {!hasAnyApiKey && (
          <div className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
            ⚠️ APIキーが設定されていないため、デフォルトのプロバイダーとモデルのみ利用できます。
            <br />
            他のプロバイダーやモデルを利用したい場合は、まずAPI設定でAPIキーを登録してください。
          </div>
        )}
        
        <div>
          <Label className="text-base font-semibold mb-4 block">使用するプロバイダー</Label>
          <RadioGroup
            value={displayProvider}
            onValueChange={handleProviderChange}
            className="space-y-3"
            disabled={!hasAnyApiKey}
          >
            {getVisibleProviders().map(provider => (
              <div key={provider.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={provider.id} 
                  id={provider.id} 
                  disabled={!hasAnyApiKey}
                  className={!hasAnyApiKey ? "opacity-50" : ""} 
                />
                <Label 
                  htmlFor={provider.id} 
                  className={`font-medium ${!hasAnyApiKey ? "text-gray-400" : ""}`}
                >
                  {provider.name}
                  {provider.isDefault && (
                    <span className="ml-2 text-xs text-amber-600">(デフォルト)</span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="border-t pt-6">
          <Label className="text-base font-semibold mb-4 block">選択可能なモデル</Label>

          <div className="space-y-4">
            {getModelProvidersToShow().map(provider => {
              const providerHasKey = hasApiKey[provider as keyof typeof hasApiKey];
              const availableModelOptions = getAvailableModels(provider);
              const displayValue = getDisplayModel(provider);

              return (
                <div key={provider}>
                  <Label className={!providerHasKey ? "text-gray-400" : ""}>
                    {provider === "openai"
                      ? "OpenAI モデル"
                      : provider === "google"
                        ? "Google Gemini モデル"
                        : "Anthropic Claude モデル"}
                  </Label>
                  <Select
                    value={displayValue}
                    onValueChange={(value) => handleModelChange(provider, value)}
                    disabled={!providerHasKey}
                  >
                    <SelectTrigger className={!providerHasKey ? "opacity-50 cursor-not-allowed" : ""}>
                      <SelectValue 
                        placeholder={
                          !providerHasKey && freeUserModels?.[provider]
                            ? `デフォルト: ${availableModelOptions.find(m => m.value === freeUserModels[provider])?.label || freeUserModels[provider]}`
                            : "モデルを選択"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                          {!providerHasKey && (
                            <span className="ml-2 text-xs text-amber-600">(デフォルト)</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
