
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProfile, ExamSettings, isValidExamSettings } from '@/types/profile';

import ProfileHeader from './profile/ProfileHeader';
import BasicInfoCard from './profile/BasicInfoCard';
import MbtiCard from './profile/MbtiCard';
import DisplaySettingsCard from './profile/DisplaySettingsCard';
import ExamSettingsCard from './profile/ExamSettingsCard';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const [profile, setProfile] = useState<UserProfile>({
    display_name: '',
    email: '',
    avatar_url: '',
    show_countdown: true,
    exam_settings: {
      kyotsu: { name: '共通テスト', date: '2026-01-17' },
      todai: { name: '東大二次試験', date: '2026-02-25' }
    },
    mbti: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
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
        const defaultExamSettings: ExamSettings = {
          kyotsu: { name: '共通テスト', date: '2026-01-17' },
          todai: { name: '東大二次試験', date: '2026-02-25' }
        };

        let examSettings = defaultExamSettings;
        if (data.exam_settings && isValidExamSettings(data.exam_settings)) {
          examSettings = data.exam_settings as ExamSettings;
        }

        setProfile({
          display_name: data.display_name || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || '',
          show_countdown: data.show_countdown ?? true,
          exam_settings: examSettings,
          mbti: data.mbti || null,
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

      const examSettingsJson = JSON.parse(JSON.stringify(profile.exam_settings));

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name || null,
          email: profile.email || null,
          avatar_url: profile.avatar_url || null,
          show_countdown: profile.show_countdown,
          exam_settings: examSettingsJson,
          mbti: profile.mbti === "不明" ? null : profile.mbti,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "保存完了",
        description: "プロフィールが更新されました。",
      });

      onBack(); // Navigate back after successful save
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
  
  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleMbtiChange = (value: string | null) => {
    setProfile(prev => ({ ...prev, mbti: value }));
  };

  const handleShowCountdownChange = (checked: boolean) => {
    setProfile(prev => ({ ...prev, show_countdown: checked }));
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
      <ProfileHeader onBack={onBack} onSave={handleSave} isSaving={isSaving} />
      
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <BasicInfoCard profile={profile} onProfileChange={handleProfileChange} />
        <MbtiCard mbti={profile.mbti} onMbtiChange={handleMbtiChange} />
        <DisplaySettingsCard 
          showCountdown={profile.show_countdown} 
          onShowCountdownChange={handleShowCountdownChange} 
        />
        <ExamSettingsCard 
          examSettings={profile.exam_settings} 
          onExamSettingChange={updateExamSetting} 
        />
      </div>
    </div>
  );
};

export default ProfileScreen;
