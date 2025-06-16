import React from 'react';
import ChatMainView from "./chat/ChatMainView";
import ConversationHistoryView from "./chat/ConversationHistoryView";
import { useChatScreen, UseChatScreenProps } from "./chat/useChatScreen";
import { ImageData } from "./chat/types";

interface ChatScreenProps extends UseChatScreenProps {
  onBackToWelcome?: () => void;
  conversationId?: string;
}

const ChatScreen = (props: ChatScreenProps) => {
  const {
    state: {
      subject,
      subjectName,
      messages,
      isLoading,
      selectedImages,
      showConfetti,
      showConversations,
      selectedConversationId,
      currentModel,
      conversations,
      messagesEndRef,
      conversationUnderstood,
    },
    handlers: {
      setSelectedImages,
      handleSendMessage,
      handleUnderstood,
      handleNewChat,
      handleShowHistory,
      handleBackToChat,
      handleSelectConversation,
      handleDeleteConversation,
      handleQuickAction,
      onToggleSidebar,
    }
  } = useChatScreen(props);

  // Convert selectedImages to ImageData format if needed
  const imageData: ImageData[] = Array.isArray(selectedImages) 
    ? selectedImages.map(img => typeof img === 'string' ? { url: img } : img)
    : [];

  const handleSetImages = (imgs: ImageData[]) => {
    // Handle image setting - for now we'll keep it simple
    console.log('Setting images:', imgs);
  };

  const handleUnderstoodWrapper = () => {
    handleUnderstood();
  };

  if (showConversations) {
    return (
      <ConversationHistoryView
        subject={subject}
        subjectName={subjectName}
        currentModel={currentModel}
        onBackToList={handleBackToChat}
        onToggleSidebar={onToggleSidebar}
        isMobile={props.isMobile}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
        onBackToWelcome={props.onBackToWelcome}
      />
    );
  }

  return (
    <ChatMainView
      subject={subject}
      subjectName={subjectName}
      currentModel={currentModel}
      messages={messages}
      isLoading={isLoading}
      selectedImages={imageData}
      setSelectedImages={handleSetImages}
      onSendMessage={handleSendMessage}
      onUnderstood={handleUnderstoodWrapper}
      onQuickAction={handleQuickAction}
      showConfetti={showConfetti}
      onNewChat={handleNewChat}
      onShowHistory={handleShowHistory}
      showNewChatButton={messages.length > 0}
      showHistoryButton={conversations.length > 0}
      onToggleSidebar={onToggleSidebar}
      isMobile={props.isMobile}
      messagesEndRef={messagesEndRef}
      conversationUnderstood={conversationUnderstood}
      onBackToWelcome={props.onBackToWelcome}
    />
  );
};

export default ChatScreen;
