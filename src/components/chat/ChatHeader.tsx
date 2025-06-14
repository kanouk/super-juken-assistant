
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, History, Menu, Cpu } from 'lucide-react';

interface ChatHeaderProps {
  subjectName: string;
  currentModel: string;
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
  onBackToList,
  onNewChat,
  onShowHistory,
  onToggleSidebar,
  showBackButton = false,
  showNewChatButton = false,
  showHistoryButton = false,
  isMobile = false
}) => {
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
            <h1 className="text-xl font-bold text-gray-900 truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {subjectName}
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block font-medium">AI学習アシスタント</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {showHistoryButton && onShowHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHistory}
              className="gap-2 hidden sm:flex hover:bg-gray-50 border-gray-300 transition-colors shadow-sm h-[44px]"
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
          <div className="flex flex-col justify-center h-[44px]">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
              <Cpu className="h-3 w-3" />
              使用モデル
            </div>
            <p className="text-xs text-gray-500 font-mono break-all">{currentModel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
