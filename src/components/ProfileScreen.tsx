import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProfile, ExamSettings, isValidExamSettings } from '@/types/profile';
import { useProfile } from '@/hooks/useProfile';

import ProfileHeader from './profile/ProfileHeader';
import BasicInfoCard from './profile/BasicInfoCard';
import MbtiCard from './profile/MbtiCard';
import DisplaySettingsCard from './profile/DisplaySettingsCard';
import ExamSettingsCard from './profile/ExamSettingsCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Star, Zap } from 'lucide-react';

interface ProfileScreenProps {
  onBack: () => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { profile: loadedProfile, isLoading: isProfileLoading, refetchProfile, uploadAvatar } = useProfile();
  
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    display_name: '',
    email: '',
    avatar_url: '',
    show_countdown: true,
    show_stats: true,
    exam_settings: {
      kyotsu: { name: '共通テスト', date: '2026-01-17' },
      todai: { name: '東大二次試験', date: '2026-02-25' }
    },
    mbti: null,
    plan: null,
    points: null,
    stripe_customer_id: null,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (loadedProfile) {
      setProfileData(loadedProfile);
    }
  }, [loadedProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const examSettingsJson = JSON.parse(JSON.stringify(profileData.exam_settings));

      const updates = {
        display_name: profileData.display_name || null,
        email: profileData.email || null,
        avatar_url: profileData.avatar_url || null,
        show_countdown: profileData.show_countdown,
        show_stats: profileData.show_stats,
        exam_settings: examSettingsJson,
        mbti: profileData.mbti === "不明" ? null : profileData.mbti,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "保存完了",
        description: "プロフィールが更新されました。",
      });
      await refetchProfile();
      onBack();
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast({
        title: "エラー",
        description: `プロフィールの保存に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    if (!uploadAvatar) return null;
    
    const newAvatarUrl = await uploadAvatar(file);
    if (newAvatarUrl) {
      setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
    }
    return newAvatarUrl;
  };

  const handleMbtiChange = (value: string | null) => {
    setProfileData(prev => ({ ...prev, mbti: value }));
  };

  const handleShowCountdownChange = (checked: boolean) => {
    setProfileData(prev => ({ ...prev, show_countdown: checked }));
  };

  const handleShowStatsChange = (checked: boolean) => {
    setProfileData(prev => ({ ...prev, show_stats: checked }));
  };

  const updateExamSetting = (exam: 'kyotsu' | 'todai', field: 'name' | 'date', value: string) => {
    setProfileData(prev => ({
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

  const handleUpgrade = () => {
    window.location.href = '/billing';
  };

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'free':
        return 'フリープラン';
      case 'one_time':
        return '買い切りプラン';
      case 'premium_monthly':
        return 'プレミアムプラン（月額）';
      default:
        return 'フリープラン';
    }
  };

  const getPlanIcon = (plan: string | null) => {
    switch (plan) {
      case 'one_time':
        return <Zap className="h-5 w-5" />;
      case 'premium_monthly':
        return <Star className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPlanColor = (plan: string | null) => {
    switch (plan) {
      case 'one_time':
        return 'from-amber-50 to-yellow-50 border-amber-200';
      case 'premium_monthly':
        return 'from-purple-50 to-pink-50 border-purple-200';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  if (isProfileLoading && !loadedProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      <ProfileHeader onBack={onBack} onSave={handleSave} isSaving={isSaving} />
      
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <BasicInfoCard 
          profile={profileData} 
          onProfileChange={handleProfileChange}
          onAvatarUpload={handleAvatarUpload} 
        />

        {/* Billing Plan Card */}
        <Card className={`bg-gradient-to-r ${getPlanColor(profileData.plan)} shadow-sm`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              {getPlanIcon(profileData.plan)}
              <span>課金プラン</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">現在のプラン</p>
                <p className="text-xl font-bold text-gray-800">{getPlanDisplayName(profileData.plan)}</p>
              </div>
              <Badge variant="outline" className="text-sm">
                {profileData.plan === 'free' ? 'フリー' : profileData.plan === 'one_time' ? '買い切り' : 'プレミアム'}
              </Badge>
            </div>
            
            {profileData.points !== null && (
              <div>
                <p className="text-sm text-gray-600">残りポイント</p>
                <p className="text-lg font-semibold text-blue-600">{profileData.points} ポイント</p>
              </div>
            )}

            {profileData.plan === 'free' && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  プレミアムプランにアップグレードして、より多くの機能を利用しませんか？
                </p>
                <Button onClick={handleUpgrade} className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  プランをアップグレード
                </Button>
              </div>
            )}

            {profileData.plan !== 'free' && (
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={handleUpgrade} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  課金設定を管理
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <MbtiCard mbti={profileData.mbti} onMbtiChange={handleMbtiChange} />
        <DisplaySettingsCard 
          showCountdown={profileData.show_countdown}
          showStats={profileData.show_stats}
          onShowCountdownChange={handleShowCountdownChange}
          onShowStatsChange={handleShowStatsChange}
        />
        <ExamSettingsCard 
          examSettings={profileData.exam_settings} 
          onExamSettingChange={updateExamSetting} 
        />
      </div>
    </div>
  );
};

export default ProfileScreen;
