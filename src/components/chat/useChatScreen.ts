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

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState('gpt-3.5-turbo');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationUnderstood, setConversationUnderstood] = useState(false);

  const { conversations, loadConversations, createConversation, deleteConversation } = useConversations(userId, subject);
  const { loadMessages, sendMessage } = useMessages(userId, currentModel);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    setIsLoading(true);
    try {
      const newMessage = await sendMessage(content, selectedImages, selectedConversationId);
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setSelectedImages([]); // reset
      scrollToBottom();
      if (!selectedConversationId) {
        // Create a new conversation
        const newConversation = await createConversation(content);
        setSelectedConversationId(newConversation.id);
        loadConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnderstood = async (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isUnderstood: true } : msg
      )
    );
    setConversationUnderstood(true);

    // Save to DB
    if (!userId) {
      console.error("handleUnderstood: User ID is not available.");
      return;
    }
    const { error } = await supabase
      .from('messages')
      .update({ is_understood: true })
      .eq('id', messageId);

    if (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    await handleSendMessage(action.message);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedConversationId(null);
    setShowConversations(false);
    setConversationUnderstood(false);
  };

  const handleShowHistory = () => {
    loadConversations();
    setShowConversations(true);
  };

  const handleBackToChat = () => {
    setShowConversations(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    loadMessages(conversationId);
    setShowConversations(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId);
    loadConversations();
    if (selectedConversationId === conversationId) {
      setMessages([]);
      setSelectedConversationId(null);
    }
  };

  const getInitialMessage = useCallback((subjectId: string): Message => {
    const japaneseName = SUBJECT_JAPANESE_NAMES[subjectId] || subjectId;
    return {
      id: uuidv4(),
      content: `こんにちは！${japaneseName}の学習をサポートします。何でも気軽に質問してください！`,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      isUnderstood: false
    };
  }, []);

  useEffect(() => {
    if (!userId || !subject) return;

    if (conversationId) {
      setSelectedConversationId(conversationId);
      loadMessages(conversationId);
    } else {
      // 新しい会話の場合、初期メッセージを設定
      const initialMessage = getInitialMessage(subject);
      setMessages([initialMessage]);
      setSelectedConversationId(null);
    }
  }, [userId, subject, conversationId, loadMessages, getInitialMessage]);

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
  };
};
