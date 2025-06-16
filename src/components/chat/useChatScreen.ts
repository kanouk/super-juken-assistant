
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMessages } from './useMessages';
import { useConversations } from './useConversations';
import { Message, QuickAction } from './types';
import { v4 as uuidv4 } from 'uuid';

export interface UseChatScreenProps {
  subject: string;
  subjectName: string;
  userId?: string;
  conversationId?: string;
  onToggleSidebar?: () => void;
  isMobile?: boolean;
}

// 教科の日本語名マッピング
const SUBJECT_JAPANESE_NAMES: Record<string, string> = {
  'math': '数学',
  'chemistry': '化学',
  'biology': '生物',
  'english': '英語',
  'japanese': '国語',
  'geography': '地理',
  'information': '情報',
  'other': '全般',
  'physics': '物理',
  'japanese_history': '日本史',
  'world_history': '世界史',
  'earth_science': '地学',
};

export const useChatScreen = (props: UseChatScreenProps) => {
  const { subject, subjectName, userId, conversationId, onToggleSidebar, isMobile } = props;

  const [showConversations, setShowConversations] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-3.5-turbo');

  const conversationsHook = useConversations(userId, subject);
  const messagesHook = useMessages({
    userId,
    subject,
    selectedConversationId: conversationsHook.selectedConversationId,
    setSelectedConversationId: conversationsHook.setSelectedConversationId,
    conversationUnderstood: conversationsHook.conversationUnderstood,
    setConversationUnderstood: conversationsHook.setConversationUnderstood,
    refetchConversations: conversationsHook.refetchConversations,
    selectedModel: currentModel,
  });

  const handleQuickAction = async (action: QuickAction) => {
    await messagesHook.handleSendMessage(action.message);
  };

  const handleNewChat = () => {
    messagesHook.setMessages([]);
    conversationsHook.setSelectedConversationId(null);
    setShowConversations(false);
    conversationsHook.setConversationUnderstood(false);
  };

  const handleShowHistory = () => {
    conversationsHook.refetchConversations();
    setShowConversations(true);
  };

  const handleBackToChat = () => {
    setShowConversations(false);
  };

  const handleSelectConversation = async (conversationId: string) => {
    const messages = await conversationsHook.handleSelectConversation(conversationId);
    messagesHook.setMessages(messages);
    setShowConversations(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await conversationsHook.handleDeleteConversation(conversationId);
    if (conversationsHook.selectedConversationId === conversationId) {
      messagesHook.setMessages([]);
      conversationsHook.setSelectedConversationId(null);
    }
  };

  const getInitialMessage = useCallback((subjectId: string): Message => {
    const japaneseName = SUBJECT_JAPANESE_NAMES[subjectId] || subjectId;
    return {
      id: uuidv4(),
      content: `こんにちは！${japaneseName}の学習をサポートします。何でも気軽に質問してください！`,
      role: 'assistant',
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      subject: subjectId,
      isUnderstood: false
    };
  }, []);

  useEffect(() => {
    if (!userId || !subject) return;

    if (conversationId) {
      conversationsHook.setSelectedConversationId(conversationId);
      conversationsHook.handleSelectConversation(conversationId).then(messages => {
        messagesHook.setMessages(messages);
      });
    } else {
      // 新しい会話の場合、初期メッセージを設定
      const initialMessage = getInitialMessage(subject);
      // Convert to MessageType format for compatibility
      const initialMessageType = {
        id: initialMessage.id,
        content: initialMessage.content,
        isUser: false,
        timestamp: new Date(),
        isUnderstood: false,
      };
      messagesHook.setMessages([initialMessageType]);
      conversationsHook.setSelectedConversationId(null);
    }
  }, [userId, subject, conversationId, getInitialMessage]);

  return {
    state: {
      subject,
      subjectName,
      messages: messagesHook.messages,
      isLoading: messagesHook.isLoading,
      selectedImages: [],
      showConfetti: messagesHook.showConfetti,
      showConversations,
      selectedConversationId: conversationsHook.selectedConversationId,
      currentModel,
      conversations: conversationsHook.conversations,
      messagesEndRef: messagesHook.messagesEndRef,
      conversationUnderstood: conversationsHook.conversationUnderstood,
    },
    handlers: {
      setSelectedImages: () => {},
      handleSendMessage: messagesHook.handleSendMessage,
      handleUnderstood: messagesHook.handleUnderstood,
      handleNewChat,
      handleShowHistory,
      handleBackToChat,
      handleSelectConversation,
      handleDeleteConversation,
      handleQuickAction,
      onToggleSidebar,
    }
  };
};
