
import React from 'react';
import ChatMainView from "./chat/ChatMainView";
import ConversationHistoryView from "./chat/ConversationHistoryView";
import { useChatScreen, UseChatScreenProps } from "./chat/useChatScreen";
import { ImageData, Message } from "./chat/types";

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
    }
  } = useChatScreen(props);

  // Convert Message[] to MessageType[] format for compatibility
  const convertedMessages = messages.map((msg: Message) => ({
    id: msg.id,
    content: msg.content,
    isUser: msg.role === 'user',
    timestamp: new Date(msg.created_at),
    images: msg.image_url ? [{ url: msg.image_url }] : undefined,
    isUnderstood: msg.is_understood,
    cost: msg.cost,
    model: msg.model,
  }));

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

  // Fix the quick action handler to match the expected signature
  const handleQuickActionWrapper = (prompt: string) => {
    const quickAction = { id: Date.now().toString(), message: prompt, label: prompt };
    handleQuickAction(quickAction);
  };

  if (showConversations) {
    return (
      <ConversationHistoryView
        subject={subject}
        subjectName={subjectName}
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
      subjectName={subjectName}
      currentModel={currentModel}
      messages={convertedMessages}
      isLoading={isLoading}
      selectedImages={imageData}
      setSelectedImages={handleSetImages}
      onSendMessage={handleSendMessage}
      onUnderstood={handleUnderstoodWrapper}
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
