import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MessageTags from './MessageTags';

interface ChatHeaderProps {
  subject: string;
  subjectName: string;
  onBack: () => void;
  onNewChat: () => void;
  messages: any[];
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  subject,
  subjectName,
  onBack,
  onNewChat,
  messages
}) => {
  const { toast } = useToast();

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">
            {subjectName}
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

      <Button variant="outline" size="sm" onClick={onNewChat}>
        <Plus className="h-4 w-4 mr-2" />
        新しい質問
      </Button>
    </div>
  );
};

export default ChatHeader;
