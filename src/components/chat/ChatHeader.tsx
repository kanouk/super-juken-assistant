
import React from 'react';
import { ArrowLeft, Plus, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MessageTags from './MessageTags';

interface ChatHeaderProps {
  subject: string;
  subjectName: string;
  onBack: () => void;
  onNewChat: () => void;
  onShowHistory?: () => void;
  messages: any[];
  showHistoryButton?: boolean;
}

// Subject mappings for Japanese names and colors
const subjectConfig = {
  math: { name: '数学', color: 'bg-blue-500', icon: '📐' },
  english: { name: '英語', color: 'bg-green-500', icon: '🇺🇸' },
  japanese: { name: '国語', color: 'bg-red-500', icon: '📝' },
  science: { name: '理科', color: 'bg-purple-500', icon: '🔬' },
  social: { name: '社会', color: 'bg-orange-500', icon: '🌍' },
  other: { name: 'その他', color: 'bg-gray-500', icon: '💬' },
};

const ChatHeader: React.FC<ChatHeaderProps> = ({
  subject,
  subjectName,
  onBack,
  onNewChat,
  onShowHistory,
  messages,
  showHistoryButton = false
}) => {
  const { toast } = useToast();
  const config = subjectConfig[subject as keyof typeof subjectConfig] || subjectConfig.other;

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className={`${config.color} text-white p-2 rounded-lg flex items-center justify-center min-w-[40px] h-10`}>
            <span className="text-lg">{config.icon}</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900">
              {config.name}
            </h1>
            {/* Show tags for the current conversation if available */}
            {messages.length > 0 && (
              <MessageTags 
                conversationId={messages[0]?.conversation_id || ''} 
                className="mt-1" 
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {showHistoryButton && onShowHistory && (
          <Button variant="outline" size="sm" onClick={onShowHistory}>
            <History className="h-4 w-4 mr-2" />
            履歴
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onNewChat}>
          <Plus className="h-4 w-4 mr-2" />
          新しい質問
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
