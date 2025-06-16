import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { useConfettiStore } from '@/store/confettiStore';
import { useCompletion } from '@/hooks/useCompletion';
import { useProfile } from '@/hooks/useProfile';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useSubject } from '@/hooks/useSubject';
import { Message, ImageData } from './types';
import { useAutoTagging } from '@/hooks/useAutoTagging';

interface QuickAction {
  id: string;
  message: string;
  label: string;
}

export interface UseChatScreenProps {
  subject?: string;
  subjectName?: string;
  initialMessages?: Message[];
  isMobile?: boolean;
  onConfettiComplete?: () => void;
}

interface State {
  messages: Message[];
  isLoading: boolean;
  selectedImages: (string | ImageData)[];
  showConfetti: boolean;
  showConversations: boolean;
  selectedConversationId: string | null;
  currentModel: string;
  conversations: any[];
  conversationUnderstood: boolean;
}

interface Handlers {
  setSelectedImages: (images: (string | ImageData)[]) => void;
  handleSendMessage: (message: string, images?: ImageData[]) => void;
  handleUnderstood: () => void;
  handleNewChat: () => void;
  handleShowHistory: () => void;
  handleBackToChat: () => void;
  handleSelectConversation: (conversationId: string) => void;
  handleDeleteConversation: (conversationId: string) => void;
  handleQuickAction: (action: QuickAction) => void;
}

export const useChatScreen = (props: UseChatScreenProps) => {
  const { subject: initialSubject, subjectName: initialSubjectName, initialMessages = [], isMobile = false, onConfettiComplete } = props;
  const [subject, setSubject] = useState(initialSubject || 'other');
  const [subjectName, setSubjectName] = useState(initialSubjectName || 'その他');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<(string | ImageData)[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini');
  const [conversationUnderstood, setConversationUnderstood] = useState(false);

  const { profile } = useProfile();
  const { toast } = useToast();
  const { conversations, createConversation, updateConversation, deleteConversation, loadConversations } = useChatHistory(subject);
  const { getCompletion } = useCompletion();
  const { celebrate } = useConfettiStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { triggerAutoTagging } = useAutoTagging();

  useEffect(() => {
    if (initialSubject) {
      setSubject(initialSubject);
    }
    if (initialSubjectName) {
      setSubjectName(initialSubjectName);
    }
  }, [initialSubject, initialSubjectName]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, subject]);

  useEffect(() => {
    if (showConfetti) {
      celebrate();
      setTimeout(() => {
        setShowConfetti(false);
        if (onConfettiComplete) {
          onConfettiComplete();
        }
      }, 2000);
    }
  }, [showConfetti, celebrate, onConfettiComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string, images?: ImageData[]) => {
    if (!message.trim() && (!images || images.length === 0)) return;
    if (isLoading) return;

    setIsLoading(true);
    const messageId = uuidv4();

    try {
      const userMessage: Message = {
        id: messageId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
        subject: subject,
        timestamp: new Date().toISOString(),
        image_url: images && images.length > 0 ? images[0].url : undefined,
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const apiRequestBody = {
        model: currentModel,
        messages: [
          { role: 'system', content: `You are a helpful assistant for ${subjectName}.` },
          ...messages,
          { role: 'user', content: message },
        ],
        image_url: images && images.length > 0 ? images[0].url : null,
        profile,
        subject,
      };

      const result = await getCompletion({
        api: '/api/completion',
        body: apiRequestBody,
      });

      if (result?.success) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: result.content,
          created_at: new Date().toISOString(),
          subject: subject,
          timestamp: new Date().toISOString(),
          image_url: result.image_url || undefined,
          model: result.model,
          cost: result.cost,
          db_id: result.messageId,
          is_understood: false,
        };

        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        setSelectedImages([]);

        if (result.conversationId) {
          setSelectedConversationId(result.conversationId);
          await updateConversation(result.conversationId, message);
        } else {
          const newConversation = await createConversation(message);
          if (newConversation?.id) {
            setSelectedConversationId(newConversation.id);
          }
        }
        
        // Trigger auto-tagging for user questions in the background
        if (userMessage && result.conversationId && message.trim()) {
          console.log('Triggering auto-tagging for new question...');
          // Don't await this - let it run in the background
          triggerAutoTagging(result.conversationId, message.trim(), subject)
            .catch(error => console.error('Background auto-tagging failed:', error));
        }

        if (result.is_understood) {
          setConversationUnderstood(true);
        }
      } else {
        toast({
          title: "エラー",
          description: "メッセージの送信に失敗しました。",
          variant: "destructive",
        });
        setMessages((prevMessages) => prevMessages.filter((m) => m.id !== messageId));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "エラー",
        description: "メッセージの送信中にエラーが発生しました。",
        variant: "destructive",
      });
      setMessages((prevMessages) => prevMessages.filter((m) => m.id !== messageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnderstood = async () => {
    if (!selectedConversationId) return;

    try {
      await updateConversation(selectedConversationId, null, true);
      setConversationUnderstood(true);
      toast({
        title: "完了",
        description: "この質問を理解したことを記録しました。",
      });
    } catch (error) {
      console.error("Failed to update conversation:", error);
      toast({
        title: "エラー",
        description: "理解したことの記録に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.message);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedConversationId(null);
    setConversationUnderstood(false);
    loadConversations();
  };

  const handleShowHistory = () => {
    setShowConversations(true);
  };

  const handleBackToChat = () => {
    setShowConversations(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversations(false);

    const selectedConversation = conversations.find((c) => c.id === conversationId);
    if (selectedConversation) {
      setConversationUnderstood(selectedConversation.is_understood || false);
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await useChatHistory(subject).loadMessages(conversationId);
        if (error) {
          throw error;
        }
        setMessages(data || []);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast({
          title: "エラー",
          description: "メッセージの読み込みに失敗しました。",
          variant: "destructive",
        });
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      if (selectedConversationId === conversationId) {
        handleNewChat();
      }
      toast({
        title: "完了",
        description: "会話履歴を削除しました。",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "エラー",
        description: "会話履歴の削除に失敗しました。",
        variant: "destructive",
      });
    } finally {
      loadConversations();
    }
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
