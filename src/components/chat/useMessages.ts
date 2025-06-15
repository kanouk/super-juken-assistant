
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { MessageType, ImageData } from './types';
import { useChatStats } from "@/hooks/useChatStats";

interface UseMessagesProps {
  userId: string | undefined;
  subject: string;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  conversationUnderstood: boolean;
  setConversationUnderstood: (understood: boolean) => void;
  refetchConversations: () => void;
  selectedModel: string;
}

export function useMessages({
  userId,
  subject,
  selectedConversationId,
  setSelectedConversationId,
  conversationUnderstood,
  setConversationUnderstood,
  refetchConversations,
  selectedModel,
}: UseMessagesProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { refetch: refetchChatStats } = useChatStats(userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async (content: string, images: ImageData[] = []) => {
    if (!content.trim() && images.length === 0) return;
    if (!userId) {
      toast({
        title: "エラー",
        description: "ユーザーが認証されていません。",
        variant: "destructive",
      });
      return;
    }

    if (conversationUnderstood) {
      toast({
        title: "この質問は理解済みです",
        description: "新しい質問を始めるには「新規チャット」を押してください。",
        variant: "destructive",
      });
      return;
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      images: images.length > 0 ? images : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let conversationId = selectedConversationId;
      
      if (!conversationId) {
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            id: uuidv4(),
            user_id: userId,
            subject: subject,
            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            created_at: new Date().toISOString(),
            is_understood: false
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
        setSelectedConversationId(conversationId);
        setConversationUnderstood(false);
        refetchConversations();
      }

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: content,
          role: 'user',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (messageError) throw messageError;

      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: content,
          subject: subject,
          conversationHistory: conversationHistory,
          images: images.length > 0 ? images : undefined,
          userId: userId,
          model: selectedModel
        }
      });

      if (error) throw error;

      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        isUnderstood: false,
      };

      setMessages(prev => [...prev, aiMessage]);

      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: data.response,
          role: 'assistant',/
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, id: aiMessageData.id.toString() }
            : msg
        )
      );

      refetchConversations();
      setTimeout(() => {
        scrollToBottom();
      }, 200);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "エラー",
        description: `メッセージの送信に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnderstood = async () => {
    if (!userId || !selectedConversationId) return;
    
    try {
      setConversationUnderstood(true);

      const { error } = await supabase
        .from('conversations')
        .update({ is_understood: true })
        .eq('id', selectedConversationId);

      if (error) {
        setConversationUnderstood(false);
        throw error;
      }

      refetchChatStats();
      refetchConversations();
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      toast({
        title: "完全に理解！",
        description: "この質問は理解済みになりました！",
      });

    } catch (error: any) {
      console.error('Error updating understood status:', error);
      toast({
        title: "エラー",
        description: "理解度の更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  return {
    messages,
    setMessages,
    isLoading,
    showConfetti,
    messagesEndRef,
    handleSendMessage,
    handleUnderstood,
    handleQuickAction,
  };
}
