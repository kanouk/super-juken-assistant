
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
}

export const ModelsTab = ({ models, selectedProvider, updateSetting }: ModelsTabProps) => {
  const openaiOptions = [
    { label: "GPT-4.1 (2025-04-14)", value: "gpt-4.1-2025-04-14" },
    { label: "O3 (2025-04-16)", value: "o3-2025-04-16" },
    { label: "O4 Mini (2025-04-16)", value: "o4-mini-2025-04-16" },
    { label: "GPT-4o（旧モデル）", value: "gpt-4o" },
  ];

  const googleOptions = [
    { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
    { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
    { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  ];

  const anthropicOptions = [
    { label: "Sonnet 4 (2025-05-14)", value: "claude-sonnet-4-20250514" },
    { label: "Opus 4 (2025-05-14)", value: "claude-opus-4-20250514" },
    { label: "3.5 Haiku (2024-10-22)", value: "claude-3-5-haiku-20241022" },
    { label: "3.7 Sonnet (2025-02-19)", value: "claude-3-7-sonnet-20250219" },
    { label: "3 Sonnet（旧モデル）", value: "claude-3-sonnet" },
    { label: "3 Haiku（旧モデル）", value: "claude-3-haiku" },
    { label: "3 Opus（旧モデル）", value: "claude-3-opus" },
  ];

  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100">
        <CardTitle className="flex items-center text-xl">
          <Brain className="h-6 w-6 mr-3 text-purple-600" />
          AIモデル設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
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
          <Label className="text-base font-semibold mb-4 block">各プロバイダーのモデル選択</Label>
          
          <div className="space-y-4">
            <div>
              <Label>OpenAI モデル</Label>
              <Select
                value={models.openai}
                onValueChange={(value) => updateSetting('models.openai', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="モデルを選択" />
                </SelectTrigger>
                <SelectContent>
                  {openaiOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Google Gemini モデル</Label>
              <Select
                value={models.google}
                onValueChange={(value) => updateSetting('models.google', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="モデルを選択" />
                </SelectTrigger>
                <SelectContent>
                  {googleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Anthropic Claude モデル</Label>
              <Select
                value={models.anthropic}
                onValueChange={(value) => updateSetting('models.anthropic', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="モデルを選択" />
                </SelectTrigger>
                <SelectContent>
                  {anthropicOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
