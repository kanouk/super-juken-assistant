
export const SUBJECT_JAPANESE_NAMES: Record<string, string> = {
  'math': '数学',
  'chemistry': '化学',
  'biology': '生物',
  'english': '英語',
  'japanese': '国語',
  'geography': '地理',
  'information': '情報',
  'other': '全般',
  'physics': '物理',
  'japanese_history': '日本史',
  'world_history': '世界史',
  'earth_science': '地学',
};

export const calculateDaysLeft = (targetDate: string) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const hasValidGoals = (profile: any) => {
  if (!profile?.exam_settings) return false;
  const { kyotsu, todai } = profile.exam_settings;
  const hasFirstGoal = kyotsu.name.trim() !== '' && kyotsu.date !== '';
  const hasSecondGoal = todai.name.trim() !== '' && todai.date !== '';
  return hasFirstGoal || hasSecondGoal;
};

export const getDisplaySubjects = (settings: any, legacySubjects: any[]) => {
  const visibleSubjects = settings?.subjectConfigs
    ?.filter((config: any) => config.visible)
    ?.sort((a: any, b: any) => a.order - b.order) || [];

  return visibleSubjects.map((config: any) => {
    const legacyData = legacySubjects.find(s => s.id === config.id);
    const japaneseName = SUBJECT_JAPANESE_NAMES[config.id] || config.id;
    return {
      id: config.id,
      name: japaneseName,
      icon: legacyData?.icon || legacyData?.Plus,
      color: legacyData?.color || 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      gradient: legacyData?.gradient || 'from-gray-400 to-gray-600'
    };
  });
};
