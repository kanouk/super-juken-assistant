
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, History, Menu, Cpu } from 'lucide-react';

// 柔らかい色味に修正した教科色マップ
const subjectColorMap: { [key: string]: string } = {
  math: 'from-sky-200 to-indigo-100',
  chemistry: 'from-purple-100 to-pink-100',
  biology: 'from-green-200 to-emerald-100',
  english: 'from-indigo-100 to-blue-100',
  japanese: 'from-rose-100 to-red-100',
  physics: 'from-orange-100 to-yellow-100',
  earth_science: 'from-cyan-100 to-blue-100',
  world_history: 'from-yellow-100 to-amber-50',
  japanese_history: 'from-pink-100 to-red-100',
  geography: 'from-teal-100 to-green-100',
  information: 'from-gray-100 to-slate-100',
  other: 'from-orange-100 to-pink-50',
};

interface ChatHeaderProps {
  subjectName: string;
  currentModel: string;
  currentSubjectId: string;
  onBackToList?: () => void;
  onNewChat?: () => void;
  onShowHistory?: () => void;
  onToggleSidebar?: () => void;
  showBackButton?: boolean;
  showNewChatButton?: boolean;
  showHistoryButton?: boolean;
  isMobile?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  subjectName,
  currentModel,
  currentSubjectId,
  onBackToList,
  onNewChat,
  onShowHistory,
  onToggleSidebar,
  showBackButton = false,
  showNewChatButton = false,
  showHistoryButton = false,
  isMobile = false
}) => {
  const colorGradient = subjectColorMap[currentSubjectId] || 'from-sky-100 to-indigo-100';
  const colorBorder = colorGradient.split(' ')[0].replace('from-', 'border-') || 'border-sky-100';

  // モデル表示名を取得
  const getModelDisplayName = (modelValue: string) => {
    const modelMap: { [key: string]: string } = {
      "gpt-4.1-2025-04-14": "GPT-4.1",
      "o3-2025-04-16": "O3",
      "o4-mini-2025-04-16": "O4 Mini",
      "gpt-4o": "GPT-4o",
      "gemini-2.5-pro": "Gemini 2.5 Pro",
      "gemini-1.5-pro": "Gemini 1.5 Pro",
      "gemini-1.5-flash": "Gemini 1.5 Flash",
      "claude-sonnet-4-20250514": "Sonnet 4",
      "claude-opus-4-20250514": "Opus 4",
      "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
      "claude-3-7-sonnet-20250219": "Claude 3.7 Sonnet",
      "claude-3-sonnet": "Claude 3 Sonnet",
      "claude-3-haiku": "Claude 3 Haiku",
      "claude-3-opus": "Claude 3 Opus",
    };
    return modelMap[modelValue] || modelValue;
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 gap-2 min-h-[72px] max-w-[100vw]">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {isMobile && onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
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
            <h1
              className={`
                text-2xl font-extrabold bg-gradient-to-r ${colorGradient} bg-clip-text text-transparent leading-tight tracking-tight
                mb-1
              `}
            >
              {subjectName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-wide uppercase">
              AI学習アシスタント
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* ボタン部・モデル部まとめてスタイリッシュに */}
          <div className="flex items-center gap-1">
            {showHistoryButton && onShowHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowHistory}
                className="gap-2 hover:bg-gray-50 border-gray-200/80 transition-colors shadow-sm rounded-lg px-3 h-10 text-sm font-semibold"
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
          {/* モデル表示: pillが一体化し、より洗練されたデザイン */}
          <div className="flex items-center gap-0 ml-0">
            <div className="flex items-center gap-1 text-[13px] px-3 py-1 rounded-l-full bg-gray-50 border border-gray-200 font-semibold text-gray-500 select-none h-8 shadow-sm border-r-0">
              <Cpu className="w-4 h-4 mr-1 opacity-70" />
              <span className="tracking-wide">モデル</span>
            </div>
            <span
              className={`
                bg-white border ${colorBorder}
                rounded-r-full border-l-0 px-3 h-8 flex items-center font-mono text-xs font-extrabold text-gray-900 tracking-tight shadow-sm
                select-none
              `}
              style={{
                borderLeft: "none",
                marginLeft: "-1px", // しっかりpillが繋がる調整
                letterSpacing: "0.02em"
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
