
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { useCompletion } from '@/hooks/useCompletion';
import { useAutoTagging } from '@/hooks/useAutoTagging';
import { Message, ImageData } from '../types';

interface UseMessageHandlingProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  profile: any;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  createConversation: (title: string) => Promise<any>;
  updateConversation: (id: string, title?: string | null, isUnderstood?: boolean) => Promise<void>;
  setConversationUnderstood: (understood: boolean) => void;
}

export const useMessageHandling = ({
  subject,
  subjectName,
  currentModel,
  profile,
  selectedConversationId,
  setSelectedConversationId,
  createConversation,
  updateConversation,
  setConversationUnderstood,
}: UseMessageHandlingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getCompletion } = useCompletion();
  const { triggerAutoTagging } = useAutoTagging();

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

  return {
    messages,
    setMessages,
    isLoading,
    handleSendMessage,
  };
};
