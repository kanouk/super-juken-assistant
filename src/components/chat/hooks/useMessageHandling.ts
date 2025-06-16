
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';

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
  const { toast } = useToast();

  // Optimized auto-tagging function with proper error handling
  const performAutoTagging = useCallback(async (conversationId: string, questionContent: string) => {
    try {
      console.log('Starting auto-tagging for conversation:', conversationId);
      
      const { data, error } = await supabase.functions.invoke('auto-tag-question', {
        body: {
          conversationId,
          questionContent,
          subject
        }
      });

      if (error) {
        console.error('Auto-tagging error:', error);
        return false;
      }

      if (data?.success && data.tagsCount > 0) {
        console.log(`Auto-tagging successful: ${data.tagsCount} tags applied`);
        toast({
          title: "自動タグ付け完了",
          description: `${data.tagsCount}個のタグが自動的に付与されました。`,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Auto-tagging failed:', error);
      return false;
    }
  }, [subject, toast]);

  const handleSendMessage = useCallback(async (content: string, images?: any[]) => {
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
      
      // Create conversation if needed
      if (!conversationId) {
        const conversation = await createConversation(content.substring(0, 50), subject);
        conversationId = conversation.id;
        setSelectedConversationId(conversationId);
      }

      // Create user message
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

      // Save user message to database
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: content,
          role: 'user',
          created_at: new Date().toISOString(),
          image_url: images?.[0]?.url
        });

      if (userMessageError) {
        console.error('Failed to save user message:', userMessageError);
      }

      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        image_url: msg.image_url
      }));

      // Call AI using unified Edge Function approach
      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: content,
          subject,
          imageUrl: images?.[0]?.url,
          conversationHistory,
          model: currentModel,
          userId: profile.id
        }
      });

      if (error) {
        throw error;
      }

      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        subject,
        conversation_id: conversationId,
        model: data.model,
        cost: data.cost,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to database
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: data.response,
          role: 'assistant',
          created_at: new Date().toISOString(),
          cost: data.cost || 0,
          model: data.model
        });

      if (aiMessageError) {
        console.error('Failed to save AI message:', aiMessageError);
      }

      // Perform auto-tagging in background after AI response is complete
      setTimeout(() => {
        performAutoTagging(conversationId!, content).catch(error => {
          console.error('Background auto-tagging failed:', error);
        });
      }, 1000); // Delay to avoid race conditions

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
  }, [messages, profile, subject, currentModel, selectedConversationId, setSelectedConversationId, createConversation, toast, performAutoTagging]);

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
