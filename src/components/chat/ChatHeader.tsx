
import React from 'react';
import { ArrowLeft, Plus, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MessageTags from './MessageTags';
import { legacySubjects } from '../sidebar/legacySubjects';

interface ChatHeaderProps {
  subject: string;
  subjectName: string;
  onBack: () => void;
  onNewChat: () => void;
  onShowHistory?: () => void;
  messages: any[];
  showHistoryButton?: boolean;
}

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
  
  // Get subject configuration from legacySubjects
  const subjectConfig = legacySubjects.find(s => s.id === subject) || legacySubjects.find(s => s.id === 'other');

  return (
    <div className={`${subjectConfig?.color || 'bg-gray-100'} border-b border-gray-200 p-4 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className={`${subjectConfig?.gradient || 'bg-gray-500'} text-white p-2 rounded-lg flex items-center justify-center min-w-[40px] h-10`}>
            {subjectConfig?.icon && <subjectConfig.icon className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900">
              {subjectConfig?.name || subjectName}
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
