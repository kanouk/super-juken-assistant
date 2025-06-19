
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star, Coins } from "lucide-react";
import { useState } from "react";

interface ModelsSettingsTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

interface ModelOption {
  label: string;
  value: string;
  isDefault?: boolean;
}

export const ModelsSettingsTab = ({ settings, updateSetting }: ModelsSettingsTabProps) => {
  const [newModels, setNewModels] = useState<Record<string, { label: string; value: string }>>({
    openai: { label: '', value: '' },
    google: { label: '', value: '' },
    anthropic: { label: '', value: '' },
  });

  const handleFreeModelChange = (provider: string, value: string) => {
    updateSetting('free_user_models', {
      ...settings.free_user_models,
      [provider]: value
    });
  };

  const handleAddModel = (provider: string) => {
    const newModel = newModels[provider];
    if (!newModel.label || !newModel.value) return;

    const currentModels = settings.available_models?.[provider] || [];
    const updatedModels = [...currentModels, { 
      label: newModel.label, 
      value: newModel.value 
    }];

    updateSetting('available_models', {
      ...settings.available_models,
      [provider]: updatedModels
    });

    // Clear the input fields
    setNewModels(prev => ({
      ...prev,
      [provider]: { label: '', value: '' }
    }));
  };

  const handleRemoveModel = (provider: string, modelIndex: number) => {
    const currentModels = settings.available_models?.[provider] || [];
    const updatedModels = currentModels.filter((_: any, index: number) => index !== modelIndex);

    updateSetting('available_models', {
      ...settings.available_models,
      [provider]: updatedModels
    });

    // If the removed model was the default, clear the default selection
    const removedModel = currentModels[modelIndex];
    if (settings.free_user_models?.[provider] === removedModel?.value) {
      handleFreeModelChange(provider, '');
    }
  };

  const handleSetAsDefault = (provider: string, modelValue: string) => {
    handleFreeModelChange(provider, modelValue);
  };

  const handleNewModelChange = (provider: string, field: 'label' | 'value', value: string) => {
    setNewModels(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const handleModelCostChange = (modelValue: string, cost: number) => {
    updateSetting('default_model_costs', {
      ...settings.default_model_costs,
      [modelValue]: cost
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
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-600" />
            モデル別消費ポイント設定
          </CardTitle>
          <CardDescription>各モデルの利用時に消費されるポイント数を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(settings.default_model_costs || {}).map(([modelValue, cost]) => (
              <div key={modelValue} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border">
                <div className="flex-1">
                  <span className="font-medium">{modelValue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`cost-${modelValue}`} className="text-sm">ポイント:</Label>
                  <Input
                    id={`cost-${modelValue}`}
                    type="number"
                    min="1"
                    value={cost as number}
                    onChange={(e) => handleModelCostChange(modelValue, parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>利用可能モデル管理</CardTitle>
          <CardDescription>ユーザー設定画面に表示されるモデル一覧を管理します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {providers.map((provider) => (
            <div key={provider.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{provider.name}</h3>
                <Badge variant="outline" className="text-sm">
                  {settings.available_models?.[provider.id]?.length || 0} モデル
                </Badge>
              </div>

              {/* 既存モデルリスト */}
              <div className="space-y-2">
                {settings.available_models?.[provider.id]?.map((model: any, index: number) => {
                  const modelCost = settings.default_model_costs?.[model.value] || 1;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{model.label}</span>
                          {settings.free_user_models?.[provider.id] === model.value && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              デフォルト
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200">
                            <Coins className="h-3 w-3 mr-1 text-amber-600" />
                            {modelCost}pt
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-600">{model.value}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {settings.free_user_models?.[provider.id] !== model.value && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetAsDefault(provider.id, model.value)}
                          >
                            デフォルトに設定
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveModel(provider.id, index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 新しいモデル追加フォーム */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">新しいモデルを追加</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`new_label_${provider.id}`} className="text-xs">表示名</Label>
                    <Input
                      id={`new_label_${provider.id}`}
                      placeholder="GPT-4o など"
                      value={newModels[provider.id]?.label || ''}
                      onChange={(e) => handleNewModelChange(provider.id, 'label', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`new_value_${provider.id}`} className="text-xs">モデル名</Label>
                    <Input
                      id={`new_value_${provider.id}`}
                      placeholder="gpt-4o など"
                      value={newModels[provider.id]?.value || ''}
                      onChange={(e) => handleNewModelChange(provider.id, 'value', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => handleAddModel(provider.id)}
                      disabled={!newModels[provider.id]?.label || !newModels[provider.id]?.value}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      追加
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
