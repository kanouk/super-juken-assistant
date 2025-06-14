
import React from 'react';
import { MessageType, Message } from './types';
import MessageItem from './MessageItem';

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
    <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 min-h-0">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={convertToMessage(message)}
          onCopyToClipboard={() => {}}
          onTypewriterComplete={() => {}}
          showQuickActions={!message.isUser && index === messages.length - 1}
          onQuickAction={onQuickAction}
          onUnderstood={() => onUnderstood(message.id)}
        />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-3 max-w-xs lg:max-w-md">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
