
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, Brain, MessageSquare, Shield, Save, Lock, Sparkles, Calculator, Languages, FlaskConical, Globe, Zap, BookOpen, Atom, MapPin, Monitor, Plus } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { settings, setSettings, saveSettings, isLoading } = useSettings();
  const [showPasscodeModal, setShowPasscodeModal] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();

  const handlePasscodeChange = (value: string) => {
    setPasscodeInput(value);
    
    // Auto-authenticate when 6 digits are entered
    if (value.length === 6) {
      if (value === settings.passcode) {
        setIsAuthenticated(true);
        setShowPasscodeModal(false);
      } else {
        // Wrong passcode - shake animation
        setIsShaking(true);
        setPasscodeInput('');
        
        // Add vibration for mobile devices
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        
        setTimeout(() => {
          setIsShaking(false);
        }, 500);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings(settings);
    setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-3xl"></div>
        
        {/* Floating Elements for Depth */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>

        {/* Main Card */}
        <div className="relative w-full max-w-sm mx-auto">
          <div className={`bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 transition-transform duration-200 ${isShaking ? 'animate-bounce' : ''}`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/30">
                <Lock className="h-10 w-10 text-white/90" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">設定へのアクセス</h1>
              <p className="text-white/70">6桁のパスコードを入力してください</p>
            </div>

            {/* Passcode Input */}
            <div className="flex justify-center mb-8">
              <InputOTP
                maxLength={6}
                value={passcodeInput}
                onChange={handlePasscodeChange}
                className="gap-2"
              >
                <InputOTPGroup>
                  <InputOTPSlot 
                    index={0}
                    className="w-12 h-12 text-white border-white/30 bg-white/10 backdrop-blur-xl"
                  />
                  <InputOTPSlot 
                    index={1}
                    className="w-12 h-12 text-white border-white/30 bg-white/10 backdrop-blur-xl"
                  />
                  <InputOTPSlot 
                    index={2}
                    className="w-12 h-12 text-white border-white/30 bg-white/10 backdrop-blur-xl"
                  />
                  <InputOTPSlot 
                    index={3}
                    className="w-12 h-12 text-white border-white/30 bg-white/10 backdrop-blur-xl"
                  />
                  <InputOTPSlot 
                    index={4}
                    className="w-12 h-12 text-white border-white/30 bg-white/10 backdrop-blur-xl"
                  />
                  <InputOTPSlot 
                    index={5}
                    className="w-12 h-12 text-white border-white/30 bg-white/10 backdrop-blur-xl"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Back Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:text-white"
                onClick={onBack}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      </div>
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
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '保存中...' : '保存'}
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
                    const subjectInfo: { [key: string]: { name: string; icon: any; color: string } } = {
                      math: { name: '数学', icon: Calculator, color: 'text-blue-600' },
                      chemistry: { name: '化学', icon: FlaskConical, color: 'text-purple-600' },
                      biology: { name: '生物', icon: Atom, color: 'text-green-600' },
                      english: { name: '英語', icon: Languages, color: 'text-indigo-600' },
                      japanese: { name: '国語', icon: BookOpen, color: 'text-red-600' },
                      geography: { name: '地理', icon: MapPin, color: 'text-teal-600' },
                      information: { name: '情報', icon: Monitor, color: 'text-gray-600' },
                      other: { name: 'その他', icon: Plus, color: 'text-orange-600' }
                    };

                    const subjectData = subjectInfo[subject];
                    if (!subjectData) return null;

                    const IconComponent = subjectData.icon;

                    return (
                      <div key={subject} className="space-y-3">
                        <Label htmlFor={`${subject}-instruction`} className="flex items-center text-sm font-medium text-gray-700">
                          <IconComponent className={`h-5 w-5 mr-2 ${subjectData.color}`} />
                          {subjectData.name}
                        </Label>
                        <Textarea
                          id={`${subject}-instruction`}
                          value={instruction}
                          onChange={(e) => updateSetting(`subjectInstructions.${subject}`, e.target.value)}
                          rows={3}
                          placeholder={`${subjectData.name}に関する指示を入力してください...`}
                          className="border-2 border-gray-200 focus:border-orange-500"
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
