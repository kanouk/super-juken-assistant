import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Calendar, Settings2, Save, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileScreenProps {
  onBack: () => void;
}

interface ExamSettings {
  kyotsu: {
    name: string;
    date: string;
  };
  todai: {
    name: string;
    date: string;
  };
}

interface UserProfile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  show_countdown: boolean;
  exam_settings: ExamSettings;
}

// 型ガード関数
const isValidExamSettings = (obj: any): obj is ExamSettings => {
  return obj && 
    typeof obj === 'object' &&
    obj.kyotsu && 
    obj.todai &&
    typeof obj.kyotsu.name === 'string' &&
    typeof obj.kyotsu.date === 'string' &&
    typeof obj.todai.name === 'string' &&
    typeof obj.todai.date === 'string';
};

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const [profile, setProfile] = useState<UserProfile>({
    display_name: '',
    email: '',
    avatar_url: '',
    show_countdown: true,
    exam_settings: {
      kyotsu: { name: '共通テスト', date: '2026-01-17' },
      todai: { name: '東大二次試験', date: '2026-02-25' }
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // デフォルトの試験設定
        const defaultExamSettings: ExamSettings = {
          kyotsu: { name: '共通テスト', date: '2026-01-17' },
          todai: { name: '東大二次試験', date: '2026-02-25' }
        };

        // exam_settingsの型安全な処理
        let examSettings = defaultExamSettings;
        if (data.exam_settings && isValidExamSettings(data.exam_settings)) {
          examSettings = data.exam_settings;
        }

        setProfile({
          display_name: data.display_name || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || '',
          show_countdown: data.show_countdown ?? true,
          exam_settings: examSettings
        });
      }
    } catch (error: any) {
      console.error('Profile loading error:', error);
      toast({
        title: "エラー",
        description: "プロフィールの読み込みに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // exam_settingsをJSONBとして適切に保存
      const examSettingsJson = JSON.parse(JSON.stringify(profile.exam_settings));

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name || null,
          email: profile.email || null,
          avatar_url: profile.avatar_url || null,
          show_countdown: profile.show_countdown,
          exam_settings: examSettingsJson
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "保存完了",
        description: "プロフィールが更新されました。",
      });

      onBack();
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast({
        title: "エラー",
        description: "プロフィールの保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateExamSetting = (exam: 'kyotsu' | 'todai', field: 'name' | 'date', value: string) => {
    setProfile(prev => ({
      ...prev,
      exam_settings: {
        ...prev.exam_settings,
        [exam]: {
          ...prev.exam_settings[exam],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>戻る</span>
            </Button>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">プロフィール設定</h1>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Basic Profile */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>基本情報</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-blue-100">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                    {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md hover:shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="display_name" className="text-sm font-medium text-gray-700">
                    表示名
                  </Label>
                  <Input
                    id="display_name"
                    value={profile.display_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="表示名を入力してください"
                    className="mt-1 bg-white/80"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="メールアドレス"
                    className="mt-1 bg-white/80"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Settings2 className="h-5 w-5 text-green-600" />
              <span>表示設定</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  カウントダウン表示
                </Label>
                <p className="text-sm text-gray-500">
                  サイドバーに入試までのカウントダウンを表示します
                </p>
              </div>
              <Switch
                checked={profile.show_countdown}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, show_countdown: checked }))}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exam Settings */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-red-600" />
              <span>入試設定</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 共通テスト */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                第一試験設定
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kyotsu_name" className="text-sm font-medium text-gray-700">
                    試験名
                  </Label>
                  <Input
                    id="kyotsu_name"
                    value={profile.exam_settings.kyotsu.name}
                    onChange={(e) => updateExamSetting('kyotsu', 'name', e.target.value)}
                    className="mt-1 bg-white/80"
                  />
                </div>
                <div>
                  <Label htmlFor="kyotsu_date" className="text-sm font-medium text-gray-700">
                    試験日
                  </Label>
                  <Input
                    id="kyotsu_date"
                    type="date"
                    value={profile.exam_settings.kyotsu.date}
                    onChange={(e) => updateExamSetting('kyotsu', 'date', e.target.value)}
                    className="mt-1 bg-white/80"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 東大二次試験 */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                第二試験設定
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="todai_name" className="text-sm font-medium text-gray-700">
                    試験名
                  </Label>
                  <Input
                    id="todai_name"
                    value={profile.exam_settings.todai.name}
                    onChange={(e) => updateExamSetting('todai', 'name', e.target.value)}
                    className="mt-1 bg-white/80"
                  />
                </div>
                <div>
                  <Label htmlFor="todai_date" className="text-sm font-medium text-gray-700">
                    試験日
                  </Label>
                  <Input
                    id="todai_date"
                    type="date"
                    value={profile.exam_settings.todai.date}
                    onChange={(e) => updateExamSetting('todai', 'date', e.target.value)}
                    className="mt-1 bg-white/80"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
