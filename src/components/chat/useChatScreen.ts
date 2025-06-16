import { useState, useRef, useEffect } from 'react';
import { useConfettiStore } from '@/store/confettiStore';
import { useProfile } from '@/hooks/useProfile';
import { ImageData } from './types';
import { useMessageHandling } from './hooks/useMessageHandling';
import { useConversationActions } from './hooks/useConversationActions';

interface QuickAction {
  id: string;
  message: string;
  label: string;
}

export interface UseChatScreenProps {
  subject?: string;
  subjectName?: string;
  initialMessages?: any[];
  isMobile?: boolean;
  onConfettiComplete?: () => void;
  conversationId?: string;
}

export const useChatScreen = (props: UseChatScreenProps) => {
  const { subject: initialSubject, subjectName: initialSubjectName, initialMessages = [], isMobile = false, onConfettiComplete, conversationId } = props;
  const [subject, setSubject] = useState(initialSubject || 'other');
  const [subjectName, setSubjectName] = useState(initialSubjectName || 'その他');
  const [selectedImages, setSelectedImages] = useState<(string | ImageData)[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini');

  const { profile } = useProfile();
  const { celebrate } = useConfettiStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use conversation actions hook
  const {
    showConversations,
    selectedConversationId,
    conversationUnderstood,
    conversations,
    setSelectedConversationId,
    setConversationUnderstood,
    createConversation,
    updateConversation,
    loadConversations,
    handleUnderstood: baseHandleUnderstood,
    handleNewChat,
    handleShowHistory,
    handleBackToChat,
    handleSelectConversation: baseHandleSelectConversation,
    handleDeleteConversation,
  } = useConversationActions({ subject });

  // Confetti trigger function
  const triggerConfetti = () => {
    setShowConfetti(true);
    celebrate();
  };

  // Use message handling hook
  const {
    messages,
    setMessages,
    isLoading,
    handleSendMessage,
    handleUnderstood: messageHandleUnderstood,
  } = useMessageHandling({
    subject,
    subjectName,
    currentModel,
    profile,
    selectedConversationId,
    setSelectedConversationId,
    createConversation,
    updateConversation,
    setConversationUnderstood,
    onConfettiTrigger: triggerConfetti,
  });

  // Override the understood handler to use the message handling version
  const handleUnderstood = messageHandleUnderstood;

  // Update subject and subjectName when props change
  useEffect(() => {
    if (initialSubject && initialSubject !== subject) {
      console.log('Subject changed from', subject, 'to', initialSubject);
      setSubject(initialSubject);
      // Clear messages when subject changes
      setMessages([]);
      setSelectedConversationId(null);
      setConversationUnderstood(false);
    }
  }, [initialSubject, subject, setMessages, setSelectedConversationId, setConversationUnderstood]);

  useEffect(() => {
    if (initialSubjectName) {
      setSubjectName(initialSubjectName);
    }
  }, [initialSubjectName]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, subject]);

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => {
        setShowConfetti(false);
        if (onConfettiComplete) {
          onConfettiComplete();
        }
      }, 2000);
    }
  }, [showConfetti, onConfettiComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.message);
  };

  const handleSelectConversation = (conversationId: string) => {
    baseHandleSelectConversation(conversationId, setMessages, () => {});
  };

  const state = {
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
  };

  const handlers = {
    setSelectedImages,
    handleSendMessage,
    handleUnderstood,
    handleNewChat,
    handleShowHistory,
    handleBackToChat,
    handleSelectConversation,
    handleDeleteConversation,
    handleQuickAction,
  };

  return { state, handlers };
};
