
export interface ExamSettings {
  kyotsu: {
    name: string;
    date: string;
  };
  todai: {
    name: string;
    date: string;
  };
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  show_countdown: boolean;
  show_stats: boolean;
  exam_settings: ExamSettings;
  mbti: string | null;
  plan: string | null;
  points: number | null;
}

// Type guard for ExamSettings
export const isValidExamSettings = (obj: any): obj is ExamSettings => {
  return obj &&
    typeof obj === 'object' &&
    obj.kyotsu &&
    obj.todai &&
    typeof obj.kyotsu.name === 'string' &&
    typeof obj.kyotsu.date === 'string' &&
    typeof obj.todai.name === 'string' &&
    typeof obj.todai.date === 'string';
};

export const MBTI_TYPES = [
  { value: "ISTJ", label: "管理者 (ISTJ)" },
  { value: "ISFJ", label: "擁護者 (ISFJ)" },
  { value: "INFJ", label: "提唱者 (INFJ)" },
  { value: "INTJ", label: "建築家 (INTJ)" },
  { value: "ISTP", label: "巨匠 (ISTP)" },
  { value: "ISFP", label: "冒険家 (ISFP)" },
  { value: "INFP", label: "仲介者 (INFP)" },
  { value: "INTP", label: "論理学者 (INTP)" },
  { value: "ESTP", label: "起業家 (ESTP)" },
  { value: "ESFP", label: "エンターテイナー (ESFP)" },
  { value: "ENFP", label: "運動家 (ENFP)" },
  { value: "ENTP", label: "討論者 (ENTP)" },
  { value: "ESTJ", label: "幹部 (ESTJ)" },
  { value: "ESFJ", label: "領事 (ESFJ)" },
  { value: "ENFJ", label: "主人公 (ENFJ)" },
  { value: "ENTJ", label: "指揮官 (ENTJ)" },
  { value: "不明", label: "不明" }
];
