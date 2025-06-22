
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
  onStreakUpdate?: () => void; // ストリーク更新コールバック追加
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

  // legacySubjectsから適切な教科名を取得
  const subjectConfig = legacySubjects.find(s => s.id === subject) || legacySubjects.find(s => s.id === 'other');
  const displaySubjectName = subjectConfig?.name || subjectName;

  // selectedImagesをImageData形式に変換（必要に応じて）
  const imageData: ImageData[] = Array.isArray(selectedImages) 
    ? selectedImages.map(img => typeof img === 'string' ? { url: img } : img)
    : [];

  const handleSetImages = (imgs: ImageData[]) => {
    console.log('画像設定:', imgs);
  };

  // 期待される署名に合わせてクイックアクションハンドラーを修正
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
      onStreakUpdate={props.onStreakUpdate} // ストリーク更新コールバックを渡す
    />
  );
};

export default ChatScreen;
