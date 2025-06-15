
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
        // デフォルトの試験設定
        const defaultExamSettings: ExamSettings = {
          kyotsu: { name: '共通テスト', date: '2026-01-17' },
          todai: { name: '東大二次試験', date: '2026-02-25' }
        };

        // exam_settingsの型安全な処理
        let examSettings = defaultExamSettings;
        // === 修正: nullや不正な場合はデフォルト採用 ===
        if (data.exam_settings && isValidExamSettings(data.exam_settings)) {
          examSettings = data.exam_settings as ExamSettings; // Cast after validation
        } else if (data.exam_settings === null) {
          examSettings = defaultExamSettings;
        }

        setProfile({
          display_name: data.display_name,
          email: data.email || user.email,
          avatar_url: data.avatar_url,
          show_countdown: data.show_countdown ?? true,
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
        .upload(filePath, file, { upsert: true }); // Use upsert to overwrite if file exists (e.g. re-upload)

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
      
      // Update profile in DB with new avatar_url
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
