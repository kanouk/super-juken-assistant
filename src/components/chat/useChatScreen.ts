
import { useState, useEffect } from 'react';
import { useChatStats } from "@/hooks/useChatStats";
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useSettings } from '@/hooks/useSettings';
import { ImageData } from './types';

export interface UseChatScreenProps {
  subject: string;
  subjectName: string;
  userId: string | undefined;
  onSubjectChange?: (subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

export function useChatScreen(props: UseChatScreenProps) {
  const { 
    subject, subjectName, userId, 
    onToggleSidebar, isMobile
  } = props;

  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [showConversations, setShowConversations] = useState(false);

  // 設定から現在のモデルを取得
  const { getCurrentModel } = useSettings();
  const currentModel = getCurrentModel();

  // Use conversation management hook
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    conversationUnderstood,
    setConversationUnderstood,
    refetchConversations,
    handleSelectConversation,
    handleDeleteConversation,
  } = useConversations(userId, subject);

  // Use messages hook
  const {
    messages,
    setMessages,
    isLoading,
    showConfetti,
    messagesEndRef,
    handleSendMessage,
    handleUnderstood,
    handleQuickAction,
  } = useMessages({
    userId,
    subject,
    selectedConversationId,
    setSelectedConversationId,
    conversationUnderstood,
    setConversationUnderstood,
    refetchConversations,
    selectedModel: currentModel,
  });

  // Chat stats for sidebar
  const { understoodCount, dailyCost, totalCost, dailyQuestions, isLoading: isLoadingStats, error: chatStatsError, refetch: refetchChatStats } = useChatStats(userId);

  useEffect(() => {
    setMessages([]);
    setSelectedConversationId(null);
    setShowConversations(false);
    setConversationUnderstood(false);
  }, [subject]);

  const handleNewChat = () => {
    setMessages([]);
    setSelectedConversationId(null);
    setShowConversations(false);
    setConversationUnderstood(false);
  };

  const handleShowHistory = () => {
    setShowConversations(true);
  };

  const handleBackToChat = () => {
    setShowConversations(false);
  };

  const handleSelectConversationWrapper = async (conversationId: string) => {
    const formattedMessages = await handleSelectConversation(conversationId);
    setMessages(formattedMessages);
    setShowConversations(false);
  };

  return {
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
      understoodCount,
      dailyCost,
      totalCost,
      dailyQuestions,
      isLoadingStats,
      chatStatsError,
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
      handleSelectConversation: handleSelectConversationWrapper,
      handleDeleteConversation,
      handleQuickAction,
      onToggleSidebar,
    }
  };
}
