
import React from 'react';
import { Message } from './types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  latestAIMessageIdForActions: string | null;
  onCopyToClipboard: (text: string) => void;
  onTypewriterComplete: (messageDbId?: string) => void; // Renamed from onAIMessageTyped for clarity
  onQuickAction: (prompt: string) => void;
  onUnderstood: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  latestAIMessageIdForActions,
  onCopyToClipboard,
  onTypewriterComplete,
  onQuickAction,
  onUnderstood,
}) => {
  return (
    <>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onCopyToClipboard={onCopyToClipboard}
          onTypewriterComplete={onTypewriterComplete}
          showQuickActions={message.role === 'assistant' && message.db_id === latestAIMessageIdForActions}
          onQuickAction={onQuickAction}
          onUnderstood={onUnderstood}
        />
      ))}
    </>
  );
};

export default MessageList;
