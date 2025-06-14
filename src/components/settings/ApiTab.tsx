
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

interface ApiTabProps {
  apiKeys: {
    openai: string;
    google: string;
    anthropic: string;
  };
  updateSetting: (path: string, value: any) => void;
}

export const ApiTab = ({ apiKeys, updateSetting }: ApiTabProps) => {
  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
        <CardTitle className="flex items-center text-xl">
          <Key className="h-6 w-6 mr-3 text-green-600" />
          APIキー設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label htmlFor="openai-key" className="text-sm font-medium text-gray-700">
            OpenAI APIキー
          </Label>
          <Input
            id="openai-key"
            type="password"
            value={apiKeys.openai}
            onChange={(e) => updateSetting('apiKeys.openai', e.target.value)}
            placeholder="sk-..."
            className="mt-2 border-2 border-gray-200 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="google-key" className="text-sm font-medium text-gray-700">
            Google AI APIキー
          </Label>
          <Input
            id="google-key"
            type="password"
            value={apiKeys.google}
            onChange={(e) => updateSetting('apiKeys.google', e.target.value)}
            placeholder="AI..."
            className="mt-2 border-2 border-gray-200 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="anthropic-key" className="text-sm font-medium text-gray-700">
            Anthropic APIキー
          </Label>
          <Input
            id="anthropic-key"
            type="password"
            value={apiKeys.anthropic}
            onChange={(e) => updateSetting('apiKeys.anthropic', e.target.value)}
            placeholder="sk-ant-..."
            className="mt-2 border-2 border-gray-200 focus:border-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};
