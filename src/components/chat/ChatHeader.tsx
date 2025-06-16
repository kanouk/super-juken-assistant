import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, History, Cpu, Calculator, FlaskConical, Atom, Languages, BookOpen, MapPin, Monitor, Globe } from 'lucide-react';
import { getModelDisplayName } from './getModelDisplayName';

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

// 科目ごと濃い色（ボーダー/pill用）と淡い色（背景用）の2種
const subjectColorMap: { [key: string]: { grad: string, border: string, bg: string } } = {
  math: {
    grad: 'from-blue-400 to-blue-600',
    border: 'border-blue-400',
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
  },
  chemistry: {
    grad: 'from-purple-400 to-purple-600',
    border: 'border-purple-400',
    bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
  },
  biology: {
    grad: 'from-green-400 to-green-600',
    border: 'border-green-400',
    bg: 'bg-gradient-to-r from-green-50 to-green-100',
  },
  english: {
    grad: 'from-indigo-400 to-indigo-600',
    border: 'border-indigo-400',
    bg: 'bg-gradient-to-r from-indigo-50 to-indigo-100',
  },
  japanese: {
    grad: 'from-red-400 to-red-600',
    border: 'border-red-400',
    bg: 'bg-gradient-to-r from-red-50 to-red-100',
  },
  physics: {
    grad: 'from-orange-400 to-orange-600',
    border: 'border-orange-400',
    bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
  },
  earth_science: {
    grad: 'from-cyan-400 to-cyan-600',
    border: 'border-cyan-400',
    bg: 'bg-gradient-to-r from-cyan-50 to-cyan-100',
  },
  world_history: {
    grad: 'from-amber-400 to-amber-600',
    border: 'border-amber-400',
    bg: 'bg-gradient-to-r from-amber-50 to-amber-100',
  },
  japanese_history: {
    grad: 'from-pink-400 to-pink-600',
    border: 'border-pink-400',
    bg: 'bg-gradient-to-r from-pink-50 to-pink-100',
  },
  geography: {
    grad: 'from-teal-400 to-teal-600',
    border: 'border-teal-400',
    bg: 'bg-gradient-to-r from-teal-50 to-teal-100',
  },
  information: {
    grad: 'from-gray-400 to-gray-600',
    border: 'border-gray-400',
    bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
  },
  other: {
    grad: 'from-orange-400 to-orange-600',
    border: 'border-orange-400',
    bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
  },
};

interface ChatHeaderProps {
  subjectName: string;
  currentModel: string;
  currentSubjectId: string;
  onBackToList?: () => void;
  onNewChat?: () => void;
  onShowHistory?: () => void;
  showBackButton?: boolean;
  showNewChatButton?: boolean;
  showHistoryButton?: boolean;
  isMobile?: boolean;
  onBackToWelcome?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  subjectName,
  currentModel,
  currentSubjectId,
  onBackToList,
  onNewChat,
  onShowHistory,
  showBackButton = false,
  showNewChatButton = false,
  showHistoryButton = false,
  isMobile = false,
  onBackToWelcome
}) => {
  // 日本語名に変換
  const displaySubjectName = SUBJECT_JAPANESE_NAMES[currentSubjectId] || SUBJECT_JAPANESE_NAMES[subjectName] || subjectName;
  const SubjectIcon = SUBJECT_ICONS[currentSubjectId] || SUBJECT_ICONS[subjectName] || Calculator;
  
  const subjectColors = subjectColorMap[currentSubjectId] || subjectColorMap['math']; // fallback
  const colorGradient = subjectColors.grad;
  const colorBorder = subjectColors.border;
  const colorBg = subjectColors.bg;

  return (
    <div className={`border-b border-gray-200 shadow-sm flex-shrink-0 ${colorBg}`}>
      <div className="flex items-center justify-between px-4 py-3 gap-2 min-h-[72px] max-w-[100vw]">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {showBackButton && onBackToList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToList}
              className="gap-2 hidden sm:flex hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              履歴に戻る
            </Button>
          )}
          {/* 教科名 & サブタイトル */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <SubjectIcon className="h-6 w-6 text-gray-600" />
              <h1
                className={`
                  text-2xl font-extrabold bg-gradient-to-r ${colorGradient} bg-clip-text text-transparent leading-tight tracking-tight
                `}
              >
                {displaySubjectName}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-wide uppercase">
              AI学習アシスタント
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            {showHistoryButton && onShowHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowHistory}
                className="gap-2 border-blue-400 text-blue-700 font-bold bg-white hover:bg-blue-50 hover:border-blue-500 transition-all shadow-sm rounded-lg px-3 h-10 text-sm"
                style={{ alignSelf: 'center' }}
              >
                <History className="h-4 w-4" />
                <span className="hidden md:inline">履歴</span>
              </Button>
            )}
            {showNewChatButton && onNewChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNewChat}
                className="gap-2 border-blue-300 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm rounded-lg px-3 h-10 font-semibold text-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">新規チャット</span>
              </Button>
            )}
          </div>
          {/* モデル表示:pill */}
          <div className="flex items-center gap-0 ml-0">
            <div className="flex items-center gap-1 text-[13px] px-3 py-1 rounded-l-full bg-gray-100 border border-gray-200 font-semibold text-gray-500 select-none h-8 shadow-sm border-r-0">
              <Cpu className="w-4 h-4 mr-1 opacity-70" />
              <span className="tracking-wide">モデル</span>
            </div>
            <span
              className={`
                bg-white border-gray-200
                rounded-r-full border border-l-0 px-3 h-8 flex items-center font-mono text-xs font-extrabold text-gray-900 tracking-tight shadow-sm
                select-none
              `}
              style={{
                borderLeft: "none",
                marginLeft: "-1px",
                letterSpacing: "0.02em",
                boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)"
              }}
            >
              {getModelDisplayName(currentModel)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
