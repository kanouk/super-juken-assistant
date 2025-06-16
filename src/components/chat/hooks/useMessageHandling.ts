
import { useState, useCallback } from 'react';
import { useCompletion } from '@/hooks/useCompletion';
import { useToast } from "@/hooks/use-toast";
import { ImageData, Message } from '../types';

interface UseMessageHandlingProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  profile: any;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  createConversation: (title: string, subject: string) => Promise<any>;
  updateConversation: (id: string, title?: string | null, isUnderstood?: boolean) => Promise<void>;
  setConversationUnderstood: (understood: boolean) => void;
  onConfettiTrigger?: () => void;
}

export const useMessageHandling = (props: UseMessageHandlingProps) => {
  const { 
    subject, 
    subjectName, 
    currentModel, 
    profile,
    selectedConversationId,
    setSelectedConversationId,
    createConversation,
    updateConversation,
    setConversationUnderstood,
    onConfettiTrigger
  } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getCompletion } = useCompletion();
  const { toast } = useToast();

  const handleSendMessage = useCallback(async (content: string, images?: ImageData[]) => {
    if (!profile?.id) {
      toast({
        title: "エラー",
        description: "プロフィールが見つかりません。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let conversationId = selectedConversationId;
      
      if (!conversationId) {
        const conversation = await createConversation(content.substring(0, 50), subject);
        conversationId = conversation.id;
        setSelectedConversationId(conversationId);
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        subject,
        image_url: images?.[0]?.url,
        conversation_id: conversationId,
      };

      setMessages(prev => [...prev, userMessage]);

      // Prepare conversation history for the Edge Function
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        image_url: msg.image_url
      }));

      const completion = await getCompletion({
        api: '/functions/v1/ask-ai',
        body: {
          message: content,
          subject,
          imageUrl: images?.[0]?.url,
          conversationHistory,
          model: currentModel,
        },
      });

      if (completion.success && completion.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: completion.data.content,
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          subject,
          conversation_id: conversationId,
          model: completion.data.model,
          cost: completion.data.cost,
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, profile, subject, subjectName, currentModel, selectedConversationId, setSelectedConversationId, createConversation, getCompletion, toast]);

  const handleUnderstood = useCallback(async () => {
    if (!selectedConversationId) return;

    try {
      await updateConversation(selectedConversationId, null, true);
      setConversationUnderstood(true);
      
      // Trigger confetti effect
      if (onConfettiTrigger) {
        onConfettiTrigger();
      }
      
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
  }, [selectedConversationId, updateConversation, setConversationUnderstood, onConfettiTrigger, toast]);

  return {
    messages,
    setMessages,
    isLoading,
    handleSendMessage,
    handleUnderstood,
  };
};
