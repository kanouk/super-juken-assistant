
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiTabProps {
  apiKeys: {
    openai: string;
    google: string;
    anthropic: string;
  };
  updateSetting: (path: string, value: any) => void;
  freeUserApiKeys?: { openai?: string; google?: string; anthropic?: string };
}

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

export const ApiTab = ({ apiKeys, updateSetting, freeUserApiKeys }: ApiTabProps) => {
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<{
    openai: VerificationStatus;
    google: VerificationStatus;
    anthropic: VerificationStatus;
  }>({
    openai: 'idle',
    google: 'idle',
    anthropic: 'idle'
  });

  const [showPassword, setShowPassword] = useState<{
    openai: boolean;
    google: boolean;
    anthropic: boolean;
  }>({
    openai: false,
    google: false,
    anthropic: false
  });

  const verifyApiKey = async (provider: string) => {
    const apiKey = apiKeys[provider as keyof typeof apiKeys];
    if (!apiKey?.trim()) {
      toast({
        title: "エラー",
        description: "APIキーが入力されていません",
        variant: "destructive",
      });
      return;
    }

    setVerificationStatus(prev => ({ ...prev, [provider]: 'loading' }));

    try {
      const { data, error } = await supabase.functions.invoke('verify-api-key', {
        body: { provider, apiKey }
      });

      if (error) throw error;

      if (data.valid) {
        setVerificationStatus(prev => ({ ...prev, [provider]: 'success' }));
        toast({
          title: "検証成功",
          description: `${provider.toUpperCase()} APIキーは有効です`,
        });
      } else {
        setVerificationStatus(prev => ({ ...prev, [provider]: 'error' }));
        toast({
          title: "検証失敗",
          description: data.error || "APIキーが無効です",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setVerificationStatus(prev => ({ ...prev, [provider]: 'error' }));
      toast({
        title: "検証エラー",
        description: "APIキーの検証中にエラーが発生しました",
        variant: "destructive",
      });
      console.error('API key verification error:', error);
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const togglePasswordVisibility = (provider: string) => {
    setShowPassword(prev => ({
      ...prev,
      [provider]: !prev[provider as keyof typeof prev]
    }));
  };

  const providers = [
    { id: 'openai', name: 'OpenAI APIキー', placeholder: 'sk-...' },
    { id: 'google', name: 'Google AI APIキー', placeholder: 'AI...' },
    { id: 'anthropic', name: 'Anthropic APIキー', placeholder: 'sk-ant-...' }
  ];

  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 p-4 lg:p-6">
        <CardTitle className="flex items-center text-lg lg:text-xl">
          <Key className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-green-600" />
          APIキー設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="text-sm text-gray-600 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 mb-2">
          💡 <strong>APIキーを登録しなくても基本的なチャット利用ができます。</strong>
          <br />
          より多くのモデルや最新モデルを使いたい場合は、ご自身のAPIキーを入力してください。
          <br />
          <span className="text-xs text-emerald-700 mt-1 block">
            ※ APIキーを設定すると、モデル設定画面でプロバイダーとモデルの選択が可能になります。
          </span>
        </div>
        
        {providers.map((provider) => (
          <div key={provider.id}>
            <Label htmlFor={`${provider.id}-key`} className="text-sm font-medium text-gray-700">
              {provider.name}
            </Label>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 relative">
                <Input
                  id={`${provider.id}-key`}
                  type={showPassword[provider.id as keyof typeof showPassword] ? "text" : "password"}
                  value={apiKeys[provider.id as keyof typeof apiKeys]}
                  onChange={(e) => {
                    updateSetting(`apiKeys.${provider.id}`, e.target.value);
                    // Reset verification status when key changes
                    setVerificationStatus(prev => ({ ...prev, [provider.id]: 'idle' }));
                  }}
                  placeholder={freeUserApiKeys?.[provider.id as keyof typeof freeUserApiKeys] ? "デフォルトキー適用中" : provider.placeholder}
                  className="border-2 border-gray-200 focus:border-green-500 text-sm lg:text-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePasswordVisibility(provider.id)}
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  {showPassword[provider.id as keyof typeof showPassword] ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => verifyApiKey(provider.id)}
                disabled={!apiKeys[provider.id as keyof typeof apiKeys]?.trim() || verificationStatus[provider.id as keyof typeof verificationStatus] === 'loading'}
                className="min-w-[80px] flex items-center gap-2"
              >
                {getStatusIcon(verificationStatus[provider.id as keyof typeof verificationStatus])}
                検証
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
