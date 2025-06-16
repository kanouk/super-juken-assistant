
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useChatHistory } from '@/hooks/useChatHistory';

interface UseConversationActionsProps {
  subject: string;
}

export const useConversationActions = ({ subject }: UseConversationActionsProps) => {
  const [showConversations, setShowConversations] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationUnderstood, setConversationUnderstood] = useState(false);
  
  const { toast } = useToast();
  const { conversations, createConversation, updateConversation, deleteConversation, loadConversations, loadMessages } = useChatHistory(subject);

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

  const handleNewChat = () => {
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

  const handleSelectConversation = (conversationId: string, setMessages: (messages: any[]) => void, setIsLoading: (loading: boolean) => void) => {
    setSelectedConversationId(conversationId);
    setShowConversations(false);

    const selectedConversation = conversations.find((c) => c.id === conversationId);
    if (selectedConversation) {
      setConversationUnderstood(selectedConversation.is_understood || false);
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await loadMessages(conversationId);
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

  return {
    showConversations,
    selectedConversationId,
    conversationUnderstood,
    conversations,
    setSelectedConversationId,
    setConversationUnderstood,
    createConversation,
    updateConversation,
    loadConversations,
    handleUnderstood,
    handleNewChat,
    handleShowHistory,
    handleBackToChat,
    handleSelectConversation,
    handleDeleteConversation,
  };
};
