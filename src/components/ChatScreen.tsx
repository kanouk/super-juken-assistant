import React from 'react';
import ChatMainView from "./chat/ChatMainView";
import ConversationHistoryView from "./chat/ConversationHistoryView";
import { useChatScreen, UseChatScreenProps } from "./chat/useChatScreen";

// チャット画面のProps
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
      selectedModel,
      displayModelOptions,
      conversations,
      messagesEndRef,
      // ...other stats
    },
    handlers: {
      setSelectedImages,
      handleModelChange,
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
        currentModel={selectedModel}
        modelOptions={displayModelOptions}
        onModelChange={handleModelChange}
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
      currentModel={selectedModel}
      modelOptions={displayModelOptions}
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
    />
  );
};

export default ChatScreen;
