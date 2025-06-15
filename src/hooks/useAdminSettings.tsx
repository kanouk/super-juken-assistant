
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// 追加：MBTIタイプ一覧
export const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
  "不明"
];

interface AdminSettings {
  default_pin: string;
  default_common_instruction: string;
  default_subject_instructions: Record<string, string>;
  free_user_api_keys: Record<string, string>;
  available_models: Record<string, Array<{label: string, value: string}>>;
  free_user_models: Record<string, string>;
  mbti_instructions: Record<string, string>; // MBTIタイプ別
}

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    default_pin: '999999',
    default_common_instruction: '',
    default_subject_instructions: {},
    free_user_api_keys: {},
    available_models: {},
    free_user_models: {},
    mbti_instructions: {}, // 追加
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap: Partial<AdminSettings> = {};
      data?.forEach((item) => {
        const key = item.setting_key as keyof AdminSettings;
        settingsMap[key] = item.setting_value as any;
      });

      setSettings(prev => ({
        ...prev,
        ...settingsMap
      }));
    } catch (error) {
      console.error('Failed to load admin settings:', error);
      toast({
        title: "設定の読み込みに失敗しました",
        description: "管理者設定を読み込めませんでした。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof AdminSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: "設定を保存しました",
        description: "管理者設定が正常に保存されました。",
      });
    } catch (error) {
      console.error('Failed to save admin settings:', error);
      toast({
        title: "設定の保存に失敗しました",
        description: "管理者設定を保存できませんでした。",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    updateSetting,
    saveSettings,
    isLoading,
  };
};
