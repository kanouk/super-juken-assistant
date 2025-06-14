
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
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  show_countdown: boolean;
  exam_settings: ExamSettings;
  mbti: string | null;
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
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
  "不明"
];
