
import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ConfettiComponent from "../Confetti";
import ChatEmptyState from "./ChatEmptyState";
import { Message, ImageData } from "./types";

interface ChatMainViewProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  messages: Message[];
  isLoading: boolean;
  isTagging: boolean;
  selectedImages: ImageData[];
  setSelectedImages: (imgs: ImageData[]) => void;
  onSendMessage: (content: string, images?: ImageData[]) => void;
  onUnderstood: () => void;
  onQuickAction: (prompt: string) => void;
  showConfetti: boolean;
  onNewChat: () => void;
  onShowHistory: () => void;
  showNewChatButton: boolean;
  showHistoryButton: boolean;
  isMobile: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversationUnderstood: boolean;
  onBackToWelcome?: () => void;
}

const ChatMainView: React.FC<ChatMainViewProps> = ({
  subject,
  subjectName,
  currentModel,
  messages,
  isLoading,
  isTagging,
  selectedImages,
  setSelectedImages,
  onSendMessage,
  onUnderstood,
  onQuickAction,
  showConfetti,
  onNewChat,
  onShowHistory,
  showNewChatButton,
  showHistoryButton,
  isMobile,
  messagesEndRef,
  conversationUnderstood,
  onBackToWelcome,
}) => {
  // モバイルでのインプットボックス高さを考慮
  const mobileInputHeight = conversationUnderstood ? 140 : 160; // 理解済み状態では少し高く

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {showConfetti && <ConfettiComponent trigger={showConfetti} />}
      <ChatHeader
        subject={subject}
        subjectName={subjectName}
        onBack={onBackToWelcome || (() => {})}
        onNewChat={onNewChat}
        onShowHistory={onShowHistory}
        messages={messages}
        showHistoryButton={showHistoryButton}
      />
      <div className={`flex-1 min-h-0 h-0 flex flex-col overflow-hidden ${
        isMobile ? `pb-[${mobileInputHeight}px]` : ''
      }`}>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatEmptyState subjectName={subjectName} />
          </div>
        ) : (
          <div className="flex-1 h-full min-h-0">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onUnderstood={onUnderstood}
              onQuickAction={onQuickAction}
              messagesEndRef={messagesEndRef}
              conversationUnderstood={conversationUnderstood}
              isMobile={isMobile}
            />
          </div>
        )}
        <MessageInput
          onSendMessage={onSendMessage}
          isLoading={isLoading || conversationUnderstood}
          selectedImages={selectedImages}
          onImagesChange={setSelectedImages}
          conversationUnderstood={conversationUnderstood}
          onNewChat={onNewChat}
        />
      </div>
    </div>
  );
};

export default ChatMainView;
