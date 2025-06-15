
import React from 'react';
import { MessageType, Message } from './types';
import MessageItem from './MessageItem';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  onUnderstood: () => void;
  onQuickAction: (prompt: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversationUnderstood: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onUnderstood,
  onQuickAction,
  messagesEndRef,
  conversationUnderstood,
}) => {
  // Convert MessageType to Message format for MessageItem
  const convertToMessage = (msg: MessageType): Message => ({
    id: msg.id,
    content: msg.content,
    role: msg.isUser ? 'user' : 'assistant',
    created_at: msg.timestamp.toISOString(),
    subject: '', // Default empty subject for legacy messages
    image_url: msg.images?.[0]?.url,
    is_understood: msg.isUnderstood
  });

  return (
    <ScrollArea className="flex-1">
      <div className="min-h-full">
        {messages.map((message, index) => {
          const isLastAIMessage = !message.isUser && index === messages.length - 1;
          
          return (
            <MessageItem
              key={message.id}
              message={convertToMessage(message)}
              onCopyToClipboard={() => {}}
              onTypewriterComplete={() => {}}
              showQuickActions={isLastAIMessage}
              onQuickAction={onQuickAction}
              onUnderstood={onUnderstood}
              isUnderstood={conversationUnderstood}
              disabled={conversationUnderstood || isLoading}
            />
          );
        })}
        
        {isLoading && (
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-green-100 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
