
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain } from "lucide-react";

interface ModelsTabProps {
  models: {
    openai: string;
    google: string;
    anthropic: string;
  };
  updateSetting: (path: string, value: any) => void;
}

export const ModelsTab = ({ models, updateSetting }: ModelsTabProps) => {
  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100">
        <CardTitle className="flex items-center text-xl">
          <Brain className="h-6 w-6 mr-3 text-purple-600" />
          AIモデル設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
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
              <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 (2025-04-14)</SelectItem>
              <SelectItem value="o3-2025-04-16">O3 (2025-04-16)</SelectItem>
              <SelectItem value="o4-mini-2025-04-16">O4 Mini (2025-04-16)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o（旧モデル）</SelectItem>
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
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
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
              <SelectItem value="claude-sonnet-4-20250514">Sonnet 4 (2025-05-14)</SelectItem>
              <SelectItem value="claude-opus-4-20250514">Opus 4 (2025-05-14)</SelectItem>
              <SelectItem value="claude-3-5-haiku-20241022">3.5 Haiku (2024-10-22)</SelectItem>
              <SelectItem value="claude-3-7-sonnet-20250219">3.7 Sonnet (2025-02-19)</SelectItem>
              <SelectItem value="claude-3-sonnet">3 Sonnet（旧モデル）</SelectItem>
              <SelectItem value="claude-3-haiku">3 Haiku（旧モデル）</SelectItem>
              <SelectItem value="claude-3-opus">3 Opus（旧モデル）</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
