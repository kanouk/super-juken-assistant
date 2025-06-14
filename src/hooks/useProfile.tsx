
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, ExamSettings, isValidExamSettings } from '@/types/profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
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
        if (data.exam_settings && isValidExamSettings(data.exam_settings)) {
          examSettings = data.exam_settings as ExamSettings; // Cast after validation
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
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return { profile, isLoading, refetchProfile: loadProfile };
};
