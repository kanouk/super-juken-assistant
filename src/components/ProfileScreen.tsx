
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

interface ProfileScreenProps {
  onBack: () => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { profile: loadedProfile, isLoading: isProfileLoading, refetchProfile, uploadAvatar } = useProfile();
  
  const [profileData, setProfileData] = useState<UserProfile>({
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
