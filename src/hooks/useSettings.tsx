import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubjectConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  instruction: string;
  color: string;
}

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
  selectedProvider: string;
  commonInstruction: string;
  subjectInstructions: {
    [key: string]: string;
  };
  subjectConfigs: SubjectConfig[];
  mbtiInstructions?: { [key: string]: string }; // 追加: 性格タイプ別カスタム指示
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

const isSubjectConfigs = (obj: any): obj is SubjectConfig[] => {
  return Array.isArray(obj) && obj.every(config => 
    config && typeof config === 'object' &&
    typeof config.id === 'string' &&
    typeof config.name === 'string' &&
    typeof config.visible === 'boolean' &&
    typeof config.order === 'number' &&
    typeof config.instruction === 'string' &&
    typeof config.color === 'string'
  );
};

const defaultSubjectConfigs: SubjectConfig[] = [
  { id: 'math', name: '数学', visible: true, order: 1, instruction: '数学の問題は段階的に解法を示し、公式の説明も含めてください。LaTeX記法を使って数式を美しく表示してください。', color: 'sky' },
  { id: 'chemistry', name: '化学', visible: true, order: 2, instruction: '化学の概念は化学式や反応式を含めて説明してください。LaTeX記法を使って化学式を正確に表示してください。', color: 'fuchsia' },
  { id: 'biology', name: '生物', visible: true, order: 3, instruction: '生物の概念は図表を用いて視覚的に説明してください。専門用語は分かりやすく解説してください。', color: 'emerald' },
  { id: 'english', name: '英語', visible: true, order: 4, instruction: '英語の文法や単語について、例文を交えて説明してください。発音記号も適宜使用してください。', color: 'indigo' },
  { id: 'japanese', name: '国語', visible: true, order: 5, instruction: '国語の内容は古文・漢文も含めて丁寧に説明してください。語彙や文法事項を重視してください。', color: 'rose' },
  { id: 'physics', name: '物理', visible: true, order: 6, instruction: '物理の問題は公式や原理を分かりやすく、図や数式を交えて解説してください。', color: 'orange' },
  { id: 'earth_science', name: '地学', visible: true, order: 7, instruction: '地学の内容は地球や宇宙、自然現象を具体例と図を用いて説明してください。', color: 'cyan' },
  { id: 'world_history', name: '世界史', visible: true, order: 8, instruction: '世界史の出来事は時代背景や因果関係を重視して説明してください。年号や史実の正確さも心がけてください。', color: 'amber' },
  { id: 'japanese_history', name: '日本史', visible: true, order: 9, instruction: '日本史の出来事は時代区分とともに流れを重視して説明してください。人物名や文化の背景も補足してください。', color: 'pink' },
  { id: 'geography', name: '地理', visible: true, order: 10, instruction: '地理の内容は地図や統計データを参考に説明してください。地域性や環境要因も考慮してください。', color: 'teal' },
  { id: 'information', name: '情報', visible: true, order: 11, instruction: '情報の内容はプログラミングやデータ処理について具体例を交えて説明してください。', color: 'gray' },
  { id: 'other', name: '全般', visible: true, order: 12, instruction: 'その他の教科についても基礎から応用まで幅広く対応します。具体例を交えて分かりやすく説明してください。', color: 'yellow' }
];

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    passcode: '999999',
    apiKeys: {
      openai: '',
      google: '',
      anthropic: ''
    },
    models: {
      openai: 'gpt-4.1-2025-04-14',
      google: 'gemini-1.5-pro',
      anthropic: 'claude-3-sonnet'
    },
    selectedProvider: 'openai',
    commonInstruction: 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。数学や化学の問題ではLaTeX記法を使って数式を表現してください。',
    subjectInstructions: {
      math: '数学の問題は段階的に解法を示し、公式の説明も含めてください。LaTeX記法を使って数式を美しく表示してください。',
      chemistry: '化学の概念は化学式や反応式を含めて説明してください。LaTeX記法を使って化学式を正確に表示してください。',
      biology: '生物の概念は図表を用いて視覚的に説明してください。専門用語は分かりやすく解説してください。',
      english: '英語の文法や単語について、例文を交えて説明してください。発音記号も適宜使用してください。',
      japanese: '国語の内容は古文・漢文も含めて丁寧に説明してください。語彙や文法事項を重視してください。',
      geography: '地理の内容は地図や統計データを参考に説明してください。地域性や環境要因も考慮してください。',
      information: '情報の内容はプログラミングやデータ処理について具体例を交えて説明してください。',
      other: 'その他の教科についても基礎から応用まで幅広く対応します。具体例を交えて分かりやすく説明してください。'
    },
    subjectConfigs: defaultSubjectConfigs,
    mbtiInstructions: {} // 追加（空で初期化）
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // 現在選択されているモデルを取得する関数
  const getCurrentModel = () => {
    const provider = settings.selectedProvider as keyof typeof settings.models;
    return settings.models[provider];
  };

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
        const selectedProvider = typeof (settingsData as any).selected_provider === 'string' 
          ? (settingsData as any).selected_provider 
          : 'openai';

        setSettings(prev => ({
          ...prev,
          passcode: profileData?.passcode || prev.passcode,
          apiKeys: isApiKeys(settingsData.api_keys) ? settingsData.api_keys : prev.apiKeys,
          models: isModels(settingsData.models) ? settingsData.models : prev.models,
          selectedProvider: selectedProvider,
          commonInstruction: typeof settingsData.common_instruction === 'string' 
            ? settingsData.common_instruction 
            : prev.commonInstruction,
          subjectInstructions: isSubjectInstructions(settingsData.subject_instructions) 
            ? settingsData.subject_instructions 
            : prev.subjectInstructions,
          subjectConfigs: isSubjectConfigs(settingsData.subject_configs) 
            ? settingsData.subject_configs 
            : prev.subjectConfigs,
          mbtiInstructions: typeof settingsData.mbti_instructions === 'object' && settingsData.mbti_instructions !== null
            ? settingsData.mbti_instructions
            : {},
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

      // 設定を設定テーブルに保存（mbti_instructionsも含める）
      const { error: settingsError } = await supabase
        .from('settings')
        .update({
          api_keys: newSettings.apiKeys,
          models: newSettings.models,
          selected_provider: newSettings.selectedProvider,
          common_instruction: newSettings.commonInstruction,
          subject_instructions: newSettings.subjectInstructions,
          subject_configs: newSettings.subjectConfigs as any,
          mbti_instructions: newSettings.mbtiInstructions || {},
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

  return { settings, setSettings, saveSettings, isLoading, getCurrentModel };
};
