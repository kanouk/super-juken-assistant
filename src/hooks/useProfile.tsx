
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
        setProfile({
          display_name: data.display_name,
          email: data.email || user.email,
          avatar_url: data.avatar_url,
          show_countdown: data.show_countdown ?? true,
          exam_settings: data.exam_settings || {
            kyotsu: { name: '共通テスト', date: '2026-01-17' },
            todai: { name: '東大二次試験', date: '2026-02-25' }
          }
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
