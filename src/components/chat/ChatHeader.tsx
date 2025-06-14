
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, History, Menu, Cpu } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
  modelOptions: { label: string; value: string }[];
  onModelChange?: (model: string) => void;
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
  modelOptions,
  onModelChange,
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

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
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
          <div className="min-w-0 flex-1">
            <h1 className={`text-xl font-bold text-gray-900 truncate bg-gradient-to-r ${colorGradient} bg-clip-text text-transparent`}>
              {subjectName}
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block font-medium">AI学習アシスタント</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 h-[60px]">
          {showHistoryButton && onShowHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHistory}
              className="gap-2 hidden sm:flex hover:bg-gray-50 border-gray-300 transition-colors shadow-sm h-[44px]"
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
              className="gap-2 hover:bg-blue-50 border-blue-300 text-blue-700 transition-colors shadow-sm h-[44px]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">新規チャット</span>
            </Button>
          )}
          {/* モデル切替ドロップダウン */}
          <div className="flex flex-col justify-center h-[44px]">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium mb-1">
              <Cpu className="h-3 w-3" />
              モデル
            </div>
            <Select value={currentModel} onValueChange={onModelChange}>
              <SelectTrigger className={`text-xs font-mono h-8 bg-white border ${colorBorder} rounded-md focus:ring-2 focus:ring-blue-300`}>
                <SelectValue />
              </SelectTrigger>
              {/* 設定で選択済みのモデルリストのみ描画 */}
              <SelectContent align="end" className="z-40 bg-white">
                {modelOptions.map(({ label, value }) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;

