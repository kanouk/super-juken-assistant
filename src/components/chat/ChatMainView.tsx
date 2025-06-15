
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
  messages: MessageType[];
  isLoading: boolean;
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
  onToggleSidebar: () => void;
  isMobile: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversationUnderstood: boolean;
}

const ChatMainView: React.FC<ChatMainViewProps> = ({
  subject,
  subjectName,
  currentModel,
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
  conversationUnderstood,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0 bg-white"> {/* h-full, min-h-0 を指定 */}
      {showConfetti && <ConfettiComponent trigger={showConfetti} />}
      <ChatHeader
        subjectName={subjectName}
        currentModel={currentModel}
        currentSubjectId={subject}
        onNewChat={onNewChat}
        onShowHistory={onShowHistory}
        showNewChatButton={showNewChatButton}
        showHistoryButton={showHistoryButton}
        onToggleSidebar={onToggleSidebar}
        isMobile={isMobile}
      />
      {/* ここからチャット本体、スクロールエリアはこの中だけ */}
      <div className="flex-1 min-h-0 h-0 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatEmptyState subjectName={subjectName} />
          </div>
        ) : (
          // flex-1, h-full, min-h-0 で内部スクロールを有効化
          <div className="flex-1 h-full min-h-0">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onUnderstood={onUnderstood}
              onQuickAction={onQuickAction}
              messagesEndRef={messagesEndRef}
              conversationUnderstood={conversationUnderstood}
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
