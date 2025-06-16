
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMessages } from './useMessages';
import { useConversations } from './useConversations';
import { useSettings } from '@/hooks/useSettings';
import { Message, QuickAction, MessageType } from './types';
import { v4 as uuidv4 } from 'uuid';

export interface UseChatScreenProps {
  subject: string;
  subjectName: string;
  userId?: string;
  conversationId?: string;
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
  const { subject, subjectName, userId, conversationId, isMobile } = props;

  const [showConversations, setShowConversations] = useState(false);
  
  // useSettingsを使用して現在のモデルを取得
  const { getCurrentModel } = useSettings();
  const currentModel = getCurrentModel();

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

  useEffect(() => {
    if (!userId || !subject) return;

    if (conversationId) {
      conversationsHook.setSelectedConversationId(conversationId);
      conversationsHook.handleSelectConversation(conversationId).then(messages => {
        messagesHook.setMessages(messages);
      });
    } else {
      // 新しい会話の場合、メッセージをクリア
      messagesHook.setMessages([]);
      conversationsHook.setSelectedConversationId(null);
    }
  }, [userId, subject, conversationId]);

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
    }
  };
};
