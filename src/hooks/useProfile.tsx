
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, ExamSettings, isValidExamSettings } from '@/types/profile';
import { v4 as uuidv4 } from 'uuid';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // 管理者設定から第1ゴールを取得
        const { data: adminData } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'default_first_goal')
          .single();

        // 型安全な変換を行う
        let defaultFirstGoal = { name: '共通テスト', date: '2026-01-17' };
        if (adminData?.setting_value && typeof adminData.setting_value === 'object' && adminData.setting_value !== null) {
          const settingValue = adminData.setting_value as any;
          if (settingValue.name && settingValue.date) {
            defaultFirstGoal = {
              name: String(settingValue.name),
              date: String(settingValue.date)
            };
          }
        }

        // デフォルトの試験設定（第1ゴールは管理者設定から取得）
        const defaultExamSettings: ExamSettings = {
          kyotsu: defaultFirstGoal,
          todai: { name: '', date: '' }
        };

        // exam_settingsの型安全な処理
        let examSettings = defaultExamSettings;
        if (data.exam_settings && isValidExamSettings(data.exam_settings)) {
          examSettings = data.exam_settings as ExamSettings;
        } else if (data.exam_settings === null) {
          examSettings = defaultExamSettings;
        }

        setProfile({
          display_name: data.display_name,
          email: data.email || user.email,
          avatar_url: data.avatar_url,
          show_countdown: data.show_countdown ?? true,
          show_stats: data.show_stats ?? true,
          exam_settings: examSettings,
          mbti: data.mbti || null,
        });
      }
    } catch (error) {
      console.error('Profile loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found for avatar upload');

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData) {
        throw new Error('Could not get public URL for avatar');
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error after avatar upload:', updateError);
        throw updateError;
      }
      
      setProfile(prevProfile => prevProfile ? { ...prevProfile, avatar_url: publicUrlData.publicUrl } : null);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return null;
    }
  };

  return { profile, isLoading, refetchProfile: loadProfile, uploadAvatar };
};
