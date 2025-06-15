
import { useState, useEffect } from 'react';
import { useChatStats } from "@/hooks/useChatStats";
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { ImageData } from './types';

export interface UseChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  userId: string | undefined;
  onSubjectChange?: (subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  availableModels?: {
    openai?: { label: string; value: string };
    google?: { label: string; value: string };
    anthropic?: { label: string; value: string };
  };
  onModelChange?: (value: string) => void;
}

export function useChatScreen(props: UseChatScreenProps) {
  const { 
    subject, subjectName, currentModel, userId, 
    onToggleSidebar, isMobile, availableModels,
    onModelChange 
  } = props;

  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [showConversations, setShowConversations] = useState(false);

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
    selectedModel,
  });

  // Chat stats for sidebar
  const { understoodCount, dailyCost, totalCost, dailyQuestions, isLoading: isLoadingStats, error: chatStatsError, refetch: refetchChatStats } = useChatStats(userId);

  useEffect(() => {
    setMessages([]);
    setSelectedConversationId(null);
    setShowConversations(false);
    setConversationUnderstood(false);
  }, [subject]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    if (onModelChange) {
      onModelChange(value);
    }
  };

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
      selectedModel,
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
      handleModelChange,
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
