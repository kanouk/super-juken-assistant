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
import { Settings, Key, Brain, MessageSquare, Shield, Save, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [showPasscodeModal, setShowPasscodeModal] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState({
    passcode: '999999',
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
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-200">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              設定へのアクセス
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              管理者権限が必要です
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="passcode" className="text-sm font-medium text-gray-700">
                6桁のパスコードを入力してください
              </Label>
              <div className="relative">
                <Input
                  id="passcode"
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-wider h-14 border-2 border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {passcodeInput.length > 0 && (
                <div className="flex justify-center space-x-2 mt-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        i < passcodeInput.length 
                          ? "bg-blue-500 shadow-md" 
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-12 border-2 hover:bg-gray-50"
                onClick={onBack}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                onClick={handlePasscodeSubmit}
                disabled={passcodeInput.length !== 6}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                認証する
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                設定
              </h1>
              <p className="text-gray-600">システム設定を管理</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-2 hover:bg-gray-50"
            >
              戻る
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>

        <Tabs defaultValue="security" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border-2 border-gray-100">
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              セキュリティ
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              API設定
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              モデル設定
            </TabsTrigger>
            <TabsTrigger value="instructions" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              指示設定
            </TabsTrigger>
          </TabsList>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="flex items-center text-xl">
                  <Shield className="h-6 w-6 mr-3 text-blue-600" />
                  セキュリティ設定
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="new-passcode" className="text-sm font-medium text-gray-700">
                    新しいパスコード（6桁）
                  </Label>
                  <Input
                    id="new-passcode"
                    type="password"
                    value={settings.passcode}
                    onChange={(e) => updateSetting('passcode', e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="max-w-xs font-mono text-center text-lg h-12 border-2 border-gray-200 focus:border-blue-500 mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <Key className="h-4 w-4 mr-1" />
                    設定画面にアクセスする際に使用されます
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api">
            <div className="space-y-6">
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
                      value={settings.apiKeys.openai}
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
                      value={settings.apiKeys.google}
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
                      value={settings.apiKeys.anthropic}
                      onChange={(e) => updateSetting('apiKeys.anthropic', e.target.value)}
                      placeholder="sk-ant-..."
                      className="mt-2 border-2 border-gray-200 focus:border-green-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Model Settings */}
          <TabsContent value="models">
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
              <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
                  <CardTitle className="flex items-center text-xl">
                    <MessageSquare className="h-6 w-6 mr-3 text-orange-600" />
                    共通インストラクション
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={settings.commonInstruction}
                    onChange={(e) => updateSetting('commonInstruction', e.target.value)}
                    rows={4}
                    placeholder="AIに対する共通の指示を入力してください..."
                    className="border-2 border-gray-200 focus:border-orange-500"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
                  <CardTitle className="text-xl">教科別インストラクション</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                        <Label htmlFor={`${subject}-instruction`} className="text-sm font-medium text-gray-700">
                          {subjectNames[subject]}
                        </Label>
                        <Textarea
                          id={`${subject}-instruction`}
                          value={instruction}
                          onChange={(e) => updateSetting(`subjectInstructions.${subject}`, e.target.value)}
                          rows={3}
                          placeholder={`${subjectNames[subject]}に関する指示を入力してください...`}
                          className="mt-2 border-2 border-gray-200 focus:border-orange-500"
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
