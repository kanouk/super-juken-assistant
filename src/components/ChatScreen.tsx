
import React from 'react';
import ChatMainView from "./chat/ChatMainView";
import ConversationHistoryView from "./chat/ConversationHistoryView";
import { useChatScreen, UseChatScreenProps } from "./chat/useChatScreen";
import { ImageData, Message } from "./chat/types";
import { legacySubjects } from './sidebar/legacySubjects';

interface ChatScreenProps extends UseChatScreenProps {
  onBackToWelcome?: () => void;
  conversationId?: string;
  onNavigateToConversation?: (subject: string, conversationId?: string) => void;
}

const ChatScreen = (props: ChatScreenProps) => {
  const {
    state: {
      subject,
      subjectName,
      messages,
      isLoading,
      isTagging,
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
    }
  } = useChatScreen(props);

  // Get the proper subject name from legacySubjects
  const subjectConfig = legacySubjects.find(s => s.id === subject) || legacySubjects.find(s => s.id === 'other');
  const displaySubjectName = subjectConfig?.name || subjectName;

  // Convert selectedImages to ImageData format if needed
  const imageData: ImageData[] = Array.isArray(selectedImages) 
    ? selectedImages.map(img => typeof img === 'string' ? { url: img } : img)
    : [];

  const handleSetImages = (imgs: ImageData[]) => {
    console.log('Setting images:', imgs);
  };

  // Fix the quick action handler to match the expected signature
  const handleQuickActionWrapper = (prompt: string) => {
    const quickAction = { id: Date.now().toString(), message: prompt, label: prompt };
    handleQuickAction(quickAction);
  };

  if (showConversations) {
    return (
      <ConversationHistoryView
        subject={subject}
        subjectName={displaySubjectName}
        currentModel={currentModel}
        onBackToList={handleBackToChat}
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
      subjectName={displaySubjectName}
      currentModel={currentModel}
      messages={messages}
      isLoading={isLoading}
      isTagging={isTagging}
      selectedImages={imageData}
      setSelectedImages={handleSetImages}
      onSendMessage={handleSendMessage}
      onUnderstood={handleUnderstood}
      onQuickAction={handleQuickActionWrapper}
      showConfetti={showConfetti}
      onNewChat={handleNewChat}
      onShowHistory={handleShowHistory}
      showNewChatButton={messages.length > 0}
      showHistoryButton={conversations.length > 0}
      isMobile={props.isMobile}
      messagesEndRef={messagesEndRef}
      conversationUnderstood={conversationUnderstood}
      onBackToWelcome={props.onBackToWelcome}
    />
  );
};

export default ChatScreen;
