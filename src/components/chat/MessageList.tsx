
import React from 'react';
import { MessageType, Message } from './types';
import MessageItem from './MessageItem';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  onUnderstood: (messageId: string) => void;
  onQuickAction: (prompt: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onUnderstood,
  onQuickAction,
  messagesEndRef,
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
    <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 bg-gray-50">
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
            onUnderstood={() => onUnderstood(message.id)}
          />
        );
      })}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-start space-x-3 max-w-4xl">
            <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-gray-100 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
