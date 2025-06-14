
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Key, Brain, MessageSquare, Shield, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [showPasscodeModal, setShowPasscodeModal] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState({
    passcode: '123456',
    apiKeys: {
      openai: '',
      google: '',
      anthropic: ''
    },
    models: {
      openai: 'gpt-4o',
      google: 'gemini-1.5-pro',
      anthropic: 'claude-3-sonnet'
    },
    commonInstruction: 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。',
    subjectInstructions: {
      math: '数学の問題は段階的に解法を示し、公式の説明も含めてください。',
      english: '英語の文法や単語について、例文を交えて説明してください。',
      science: '理科の概念は図表を用いて視覚的に説明してください。',
      social: '社会科の内容は歴史的背景や因果関係を重視して説明してください。',
      physics: '物理の問題は公式の導出過程も含めて説明してください。',
      history: '歴史の出来事は時代背景と関連付けて説明してください。'
    }
  });
  const { toast } = useToast();

  const handlePasscodeSubmit = () => {
    if (passcodeInput === settings.passcode) {
      setIsAuthenticated(true);
      setShowPasscodeModal(false);
    } else {
      toast({
        title: "認証エラー",
        description: "パスコードが正しくありません。",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Save settings to Supabase
      console.log('Saving settings:', settings);
      
      toast({
        title: "設定を保存しました",
        description: "変更内容が正常に保存されました。",
      });
    } catch (error) {
      toast({
        title: "保存エラー",
        description: "設定の保存に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={showPasscodeModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              設定へのアクセス
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="passcode">6桁のパスコードを入力してください</Label>
              <Input
                id="passcode"
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onBack}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1"
                onClick={handlePasscodeSubmit}
                disabled={passcodeInput.length !== 6}
              >
                認証
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onBack}>
              戻る
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security">セキュリティ</TabsTrigger>
            <TabsTrigger value="api">API設定</TabsTrigger>
            <TabsTrigger value="models">モデル設定</TabsTrigger>
            <TabsTrigger value="instructions">指示設定</TabsTrigger>
          </TabsList>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  セキュリティ設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-passcode">新しいパスコード（6桁）</Label>
                  <Input
                    id="new-passcode"
                    type="password"
                    value={settings.passcode}
                    onChange={(e) => updateSetting('passcode', e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="max-w-xs font-mono"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    設定画面にアクセスする際に使用されます
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    APIキー設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI APIキー</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={settings.apiKeys.openai}
                      onChange={(e) => updateSetting('apiKeys.openai', e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="google-key">Google AI APIキー</Label>
                    <Input
                      id="google-key"
                      type="password"
                      value={settings.apiKeys.google}
                      onChange={(e) => updateSetting('apiKeys.google', e.target.value)}
                      placeholder="AI..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="anthropic-key">Anthropic APIキー</Label>
                    <Input
                      id="anthropic-key"
                      type="password"
                      value={settings.apiKeys.anthropic}
                      onChange={(e) => updateSetting('apiKeys.anthropic', e.target.value)}
                      placeholder="sk-ant-..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Model Settings */}
          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AIモデル設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>OpenAI モデル</Label>
                  <Select
                    value={settings.models.openai}
                    onValueChange={(value) => updateSetting('models.openai', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Google AI モデル</Label>
                  <Select
                    value={settings.models.google}
                    onValueChange={(value) => updateSetting('models.google', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Anthropic モデル</Label>
                  <Select
                    value={settings.models.anthropic}
                    onValueChange={(value) => updateSetting('models.anthropic', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructions Settings */}
          <TabsContent value="instructions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    共通インストラクション
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={settings.commonInstruction}
                    onChange={(e) => updateSetting('commonInstruction', e.target.value)}
                    rows={4}
                    placeholder="AIに対する共通の指示を入力してください..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>教科別インストラクション</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.subjectInstructions).map(([subject, instruction]) => {
                    const subjectNames: { [key: string]: string } = {
                      math: '数学',
                      english: '英語',
                      science: '理科',
                      social: '社会',
                      physics: '物理',
                      history: '歴史'
                    };

                    return (
                      <div key={subject}>
                        <Label htmlFor={`${subject}-instruction`}>
                          {subjectNames[subject]}
                        </Label>
                        <Textarea
                          id={`${subject}-instruction`}
                          value={instruction}
                          onChange={(e) => updateSetting(`subjectInstructions.${subject}`, e.target.value)}
                          rows={3}
                          placeholder={`${subjectNames[subject]}に関する指示を入力してください...`}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsScreen;
