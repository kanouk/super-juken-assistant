
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, History, Menu } from 'lucide-react';

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
    <div className="bg-white border-b border-gray-200 p-3 lg:p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
          {isMobile && onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden p-2"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          {showBackButton && onBackToList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToList}
              className="gap-2 hidden sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              履歴に戻る
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{subjectName}</h1>
            <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">AI学習アシスタント</p>
          </div>
        </div>
        <div className="flex items-center gap-1 lg:gap-3 flex-shrink-0">
          {showHistoryButton && onShowHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHistory}
              className="gap-2 hidden sm:flex"
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
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">新規チャット</span>
            </Button>
          )}
          <div className="text-right hidden lg:block">
            <p className="text-sm text-gray-600">使用モデル</p>
            <p className="text-xs text-gray-500">{currentModel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
