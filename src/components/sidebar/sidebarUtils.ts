
import { Calculator, Languages, FlaskConical, Globe, Zap, Atom, MapPin, Monitor, Plus, BookOpen } from "lucide-react";

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

export const getSubjectIcon = (subjectId: string) => {
  const iconMap: { [key: string]: React.ElementType } = {
    math: Calculator,
    chemistry: FlaskConical,
    biology: Atom,
    english: Languages,
    japanese: BookOpen,
    physics: Zap,
    earth_science: Globe,
    world_history: Globe,
    japanese_history: BookOpen,
    geography: MapPin,
    information: Monitor,
    other: Plus
  };
  return iconMap[subjectId] || Plus;
};

export const getSubjectGradient = (subjectId: string) => {
  const gradientMap: { [key: string]: string } = {
    math: 'from-sky-500 to-sky-600',
    chemistry: 'from-fuchsia-500 to-fuchsia-600',
    biology: 'from-emerald-500 to-emerald-600',
    english: 'from-indigo-500 to-indigo-600',
    japanese: 'from-rose-500 to-rose-600',
    physics: 'from-orange-500 to-orange-600',
    earth_science: 'from-cyan-500 to-cyan-600',
    world_history: 'from-amber-500 to-amber-600',
    japanese_history: 'from-pink-500 to-pink-600',
    geography: 'from-teal-500 to-teal-600',
    information: 'from-gray-500 to-gray-600',
    other: 'from-yellow-500 to-yellow-600'
  };
  return gradientMap[subjectId] || 'from-gray-400 to-gray-600';
};

export const getSubjectBackgroundColor = (subjectId: string) => {
  const colorMap: { [key: string]: string } = {
    math: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
    chemistry: 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200',
    biology: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    english: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    japanese: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
    physics: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    earth_science: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    world_history: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    japanese_history: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    geography: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
    information: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    other: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  };
  return colorMap[subjectId] || 'bg-gray-100 text-gray-700 hover:bg-gray-200';
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

export const getDisplaySubjects = (settings: any) => {
  if (!settings?.subjectConfigs) return [];

  const visibleSubjects = settings.subjectConfigs
    .filter((config: any) => config.visible)
    .sort((a: any, b: any) => a.order - b.order);

  return visibleSubjects.map((config: any) => {
    const japaneseName = SUBJECT_JAPANESE_NAMES[config.id] || config.name;
    return {
      id: config.id,
      name: japaneseName,
      icon: getSubjectIcon(config.id),
      color: getSubjectBackgroundColor(config.id),
      gradient: getSubjectGradient(config.id)
    };
  });
};
