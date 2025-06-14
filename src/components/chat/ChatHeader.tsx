
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, History } from 'lucide-react';

interface ChatHeaderProps {
  subjectName: string;
  currentModel: string;
  onBackToList?: () => void;
  onNewChat?: () => void;
  onShowHistory?: () => void;
  showBackButton?: boolean;
  showNewChatButton?: boolean;
  showHistoryButton?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  subjectName, 
  currentModel, 
  onBackToList,
  onNewChat,
  onShowHistory,
  showBackButton = false,
  showNewChatButton = false,
  showHistoryButton = false
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && onBackToList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToList}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              履歴に戻る
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{subjectName}</h1>
            <p className="text-sm text-gray-500">AI学習アシスタント</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showHistoryButton && onShowHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHistory}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              履歴
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
              新規チャット
            </Button>
          )}
          <div className="text-right">
            <p className="text-sm text-gray-600">使用モデル</p>
            <p className="text-xs text-gray-500">{currentModel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
