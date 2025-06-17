
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
  const subjectConfig = legacySubjects.find(s => s.id === subject) || legacySubjects.find(s => s.id === 'other') || {
    name: subjectName,
    color: 'bg-gray-100',
    gradient: 'bg-gray-500',
    icon: null
  };

  // Get conversation ID from messages, but only if it's a valid UUID
  const conversationId = messages.length > 0 && messages[0]?.conversation_id && 
    messages[0].conversation_id !== '' && 
    messages[0].conversation_id.length > 10 ? messages[0].conversation_id : null;

  return (
    <div className={`${subjectConfig.color} border-b border-gray-200 p-4 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="md:flex hidden">
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        
        {/* Mobile back button - icon only */}
        <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className={`${subjectConfig.gradient} text-white p-2 rounded-lg flex items-center justify-center min-w-[40px] h-10`}>
            {subjectConfig.icon && React.createElement(subjectConfig.icon, { className: "h-5 w-5" })}
          </div>
          <div className="flex flex-col">
            {/* Desktop: Full subject name */}
            <h1 className="text-lg font-semibold text-gray-900 hidden md:block">
              {subjectConfig.name || subjectName}
            </h1>
            {/* Mobile: Short subject name */}
            <h1 className="text-base font-semibold text-gray-900 md:hidden">
              {(subjectConfig.name || subjectName).substring(0, 6)}
            </h1>
            {/* Show tags for the current conversation if available and valid - hide on mobile */}
            {conversationId && (
              <div className="mt-1 hidden md:block">
                <MessageTags conversationId={conversationId} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {showHistoryButton && onShowHistory && (
          <Button variant="outline" size="sm" onClick={onShowHistory} className="hidden md:flex">
            <History className="h-4 w-4 mr-2" />
            履歴
          </Button>
        )}
        {showHistoryButton && onShowHistory && (
          <Button variant="outline" size="sm" onClick={onShowHistory} className="md:hidden">
            <History className="h-4 w-4" />
          </Button>
        )}
        {/* Desktop button */}
        <Button variant="outline" size="sm" onClick={onNewChat} className="hidden md:flex">
          <Plus className="h-4 w-4 mr-2" />
          新しい質問
        </Button>
        {/* Mobile button - icon only */}
        <Button variant="outline" size="sm" onClick={onNewChat} className="md:hidden">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
