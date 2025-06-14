
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  passcode: string;
  apiKeys: {
    openai: string;
    google: string;
    anthropic: string;
  };
  models: {
    openai: string;
    google: string;
    anthropic: string;
  };
  commonInstruction: string;
  subjectInstructions: {
    [key: string]: string;
  };
}

// 型ガード関数
const isApiKeys = (obj: any): obj is { openai: string; google: string; anthropic: string } => {
  return obj && typeof obj === 'object' && 
         typeof obj.openai === 'string' && 
         typeof obj.google === 'string' && 
         typeof obj.anthropic === 'string';
};

const isModels = (obj: any): obj is { openai: string; google: string; anthropic: string } => {
  return obj && typeof obj === 'object' && 
         typeof obj.openai === 'string' && 
         typeof obj.google === 'string' && 
         typeof obj.anthropic === 'string';
};

const isSubjectInstructions = (obj: any): obj is { [key: string]: string } => {
  return obj && typeof obj === 'object' && 
         Object.values(obj).every(val => typeof val === 'string');
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    passcode: '999999',
    apiKeys: {
      openai: '',
      google: '',
      anthropic: ''
    },
    models: {
      openai: 'gpt-4o',
      google: 'gemini-1.5-pro',
      anthropic: 'claude-3-sonnet'
    },
    commonInstruction: 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。',
    subjectInstructions: {
      math: '数学の問題は段階的に解法を示し、公式の説明も含めてください。',
      english: '英語の文法や単語について、例文を交えて説明してください。',
      science: '理科の概念は図表を用いて視覚的に説明してください。',
      social: '社会科の内容は歴史的背景や因果関係を重視して説明してください。',
      physics: '物理の問題は公式の導出過程も含めて説明してください。',
      history: '歴史の出来事は時代背景と関連付けて説明してください。'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // プロフィールからパスコードを取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('passcode')
        .eq('id', user.id)
        .single();

      // 設定データを取得
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', user.id)
        .single();

      if (settingsData) {
        setSettings(prev => ({
          ...prev,
          passcode: profileData?.passcode || prev.passcode,
          apiKeys: isApiKeys(settingsData.api_keys) ? settingsData.api_keys : prev.apiKeys,
          models: isModels(settingsData.models) ? settingsData.models : prev.models,
          commonInstruction: typeof settingsData.common_instruction === 'string' 
            ? settingsData.common_instruction 
            : prev.commonInstruction,
          subjectInstructions: isSubjectInstructions(settingsData.subject_instructions) 
            ? settingsData.subject_instructions 
            : prev.subjectInstructions
        }));
      }
    } catch (error) {
      console.error('Settings loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // パスコードをプロフィールに保存
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ passcode: newSettings.passcode })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 設定を設定テーブルに保存
      const { error: settingsError } = await supabase
        .from('settings')
        .update({
          api_keys: newSettings.apiKeys,
          models: newSettings.models,
          common_instruction: newSettings.commonInstruction,
          subject_instructions: newSettings.subjectInstructions
        })
        .eq('id', user.id);

      if (settingsError) throw settingsError;

      setSettings(newSettings);
      
      toast({
        title: "設定を保存しました",
        description: "変更内容が正常に保存されました。",
      });

      return true;
    } catch (error: any) {
      console.error('Settings save error:', error);
      toast({
        title: "保存エラー",
        description: "設定の保存に失敗しました。",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return { settings, setSettings, saveSettings, isLoading };
};
