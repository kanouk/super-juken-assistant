
import React from 'react';
import ChatMainView from "./chat/ChatMainView";
import ConversationHistoryView from "./chat/ConversationHistoryView";
import { useChatScreen, UseChatScreenProps } from "./chat/useChatScreen";

interface ChatScreenProps extends UseChatScreenProps {}

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
      selectedImages={selectedImages}
      setSelectedImages={setSelectedImages}
      onSendMessage={handleSendMessage}
      onUnderstood={handleUnderstood}
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
    />
  );
};

export default ChatScreen;
