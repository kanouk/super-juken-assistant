
import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ConfettiComponent from "../Confetti";
import ChatEmptyState from "./ChatEmptyState";
import { MessageType, ImageData } from "./types";

interface ChatMainViewProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  modelOptions: { label: string; value: string }[];
  onModelChange?: (model: string) => void;
  messages: MessageType[];
  isLoading: boolean;
  selectedImages: ImageData[];
  setSelectedImages: (imgs: ImageData[]) => void;
  onSendMessage: (content: string, images?: ImageData[]) => void;
  onUnderstood: (id: string) => void;
  onQuickAction: (prompt: string) => void;
  showConfetti: boolean;
  onNewChat: () => void;
  onShowHistory: () => void;
  showNewChatButton: boolean;
  showHistoryButton: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMainView: React.FC<ChatMainViewProps> = ({
  subject,
  subjectName,
  currentModel,
  modelOptions,
  onModelChange,
  messages,
  isLoading,
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
  onToggleSidebar,
  isMobile,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {showConfetti && <ConfettiComponent trigger={showConfetti} />}
      <ChatHeader
        subjectName={subjectName}
        currentModel={currentModel}
        modelOptions={modelOptions}
        onModelChange={onModelChange}
        currentSubjectId={subject}
        onNewChat={onNewChat}
        onShowHistory={onShowHistory}
        showNewChatButton={showNewChatButton}
        showHistoryButton={showHistoryButton}
        onToggleSidebar={onToggleSidebar}
        isMobile={isMobile}
      />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatEmptyState subjectName={subjectName} />
          </div>
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onUnderstood={onUnderstood}
            onQuickAction={onQuickAction}
            messagesEndRef={messagesEndRef}
          />
        )}
        <MessageInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          selectedImages={selectedImages}
          onImagesChange={setSelectedImages}
        />
      </div>
    </div>
  );
};

export default ChatMainView;
