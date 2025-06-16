
import React from 'react';
import { Bot, Calculator, FlaskConical, Atom, Languages, BookOpen, MapPin, Monitor, Globe, Plus } from 'lucide-react';

// 教科の日本語名マッピング
const SUBJECT_JAPANESE_NAMES: Record<string, string> = {
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

// 教科アイコンマッピング
const SUBJECT_ICONS: Record<string, React.ElementType> = {
  'math': Calculator,
  'chemistry': FlaskConical,
  'biology': Atom,
  'english': Languages,
  'japanese': BookOpen,
  'geography': MapPin,
  'information': Monitor,
  'other': Plus,
  'physics': Atom,
  'japanese_history': BookOpen,
  'world_history': BookOpen,
  'earth_science': Globe,
};

interface ChatEmptyStateProps {
  subjectName: string;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ subjectName }) => {
  const displaySubjectName = SUBJECT_JAPANESE_NAMES[subjectName] || subjectName;
  const SubjectIcon = SUBJECT_ICONS[subjectName] || Calculator;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {displaySubjectName}の学習をサポートします
        </h2>
        <p className="text-gray-600 mb-6">
          何でも気軽に質問してください！
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <SubjectIcon className="w-4 h-4" />
          <span>AI学習アシスタント</span>
        </div>
      </div>
    </div>
  );
};

export default ChatEmptyState;
