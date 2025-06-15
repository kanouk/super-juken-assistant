
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
  freeUserApiKeys?: { openai?: string; google?: string; anthropic?: string };
}

export const ApiTab = ({ apiKeys, updateSetting, freeUserApiKeys }: ApiTabProps) => {
  // APIキーが1つもセットされていなければ管理者デフォルトを使っている状態
  const userKeySet =
    !!apiKeys.openai || !!apiKeys.google || !!apiKeys.anthropic;

  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 p-4 lg:p-6">
        <CardTitle className="flex items-center text-lg lg:text-xl">
          <Key className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-green-600" />
          APIキー設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {!userKeySet && (
          <div className="text-xs text-gray-600 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 mb-2">
            ※ APIキーを登録しなくても最低限のチャット利用ができます（管理者が指定したデフォルトAPIキーが自動で適用されます）。<br />
            より多くのモデルや最新モデルを使いたい場合は、ご自身のAPIキーを入力してください。
          </div>
        )}
        <div>
          <Label htmlFor="openai-key" className="text-sm font-medium text-gray-700">
            OpenAI APIキー
          </Label>
          <Input
            id="openai-key"
            type="password"
            value={apiKeys.openai}
            onChange={(e) => updateSetting('apiKeys.openai', e.target.value)}
            placeholder={freeUserApiKeys?.openai ? "管理者デフォルトキー適用中" : "sk-..."}
            className="mt-2 border-2 border-gray-200 focus:border-green-500 text-sm lg:text-base"
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
            placeholder={freeUserApiKeys?.google ? "管理者デフォルトキー適用中" : "AI..."}
            className="mt-2 border-2 border-gray-200 focus:border-green-500 text-sm lg:text-base"
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
            placeholder={freeUserApiKeys?.anthropic ? "管理者デフォルトキー適用中" : "sk-ant-..."}
            className="mt-2 border-2 border-gray-200 focus:border-green-500 text-sm lg:text-base"
          />
        </div>
      </CardContent>
    </Card>
  );
};

