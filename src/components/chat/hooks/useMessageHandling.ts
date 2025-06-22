
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
  onUrlUpdate?: (conversationId: string) => void;
  onStreakUpdate?: () => void; // Add streak update callback
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
    onConfettiTrigger,
    onUrlUpdate,
    onStreakUpdate
  } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const { toast } = useToast();

  // Auto-tagging function for when conversation is understood
  const performAutoTagging = useCallback(async (conversationId: string, messages: Message[]) => {
    try {
      console.log('🏷️ Starting auto-tagging for conversation:', conversationId);
      setIsTagging(true);
      
      // Get the user's question and AI's response
      const userMessage = messages.find(msg => msg.role === 'user');
      const assistantMessage = messages.find(msg => msg.role === 'assistant');
      
      if (!userMessage) {
        console.log('❌ No user message found for tagging');
        toast({
          title: "タグ付けエラー",
          description: "ユーザーメッセージが見つかりません。",
          variant: "destructive",
        });
        return false;
      }

      const conversationContent = {
        question: userMessage.content,
        answer: assistantMessage?.content || '',
        subject: subject
      };

      console.log('📤 Sending auto-tagging request...');
      const { data, error } = await supabase.functions.invoke('auto-tag-question', {
        body: {
          conversationId,
          conversationContent,
          subject
        }
      });

      console.log('📥 Auto-tagging response:', data);
      
      if (error) {
        console.error('❌ Auto-tagging error:', error);
        toast({
          title: "自動タグ付けエラー",
          description: `タグ付けに失敗しました: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (data?.success) {
        if (data.tagsCount > 0) {
          console.log(`✅ Auto-tagging successful: ${data.tagsCount} tags applied`);
          toast({
            title: "自動タグ付け完了",
            description: `${data.tagsCount}個のタグが自動的に付与されました。\n教科: ${data.subject}\n利用可能タグ数: ${data.availableTags}`,
          });
        } else {
          console.log('ℹ️ Auto-tagging completed but no tags were applied');
          toast({
            title: "タグ付け完了",
            description: `教科「${data.subject}」で処理しましたが、適用可能なタグがありませんでした。\n利用可能タグ数: ${data.availableTags}`,
          });
        }
      } else {
        console.log('⚠️ Auto-tagging completed with warnings');
        toast({
          title: "タグ付け警告",
          description: data?.message || "タグ付け処理が完了しましたが、予期しない結果でした。",
          variant: "destructive",
        });
      }
      
      return true;
    } catch (error) {
      console.error('💥 Auto-tagging failed:', error);
      toast({
        title: "自動タグ付けエラー",
        description: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTagging(false);
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
        
        // Update URL when new conversation is created
        if (onUrlUpdate && conversationId) {
          onUrlUpdate(conversationId);
        }
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

      console.log('🚀 Calling AI and updating streak...');

      // Call AI using unified Edge Function approach (streak will be auto-updated)
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

      // Trigger streak data refresh
      console.log('🔄 Triggering streak data refresh...');
      if (onStreakUpdate) {
        onStreakUpdate();
      }

      console.log('✅ Message sent and streak updated successfully');

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
  }, [messages, profile, subject, currentModel, selectedConversationId, setSelectedConversationId, createConversation, toast, onUrlUpdate, onStreakUpdate]);

  const handleUnderstood = useCallback(async () => {
    if (!selectedConversationId) return;

    try {
      // Update conversation as understood
      await updateConversation(selectedConversationId, null, true);
      setConversationUnderstood(true);
      
      // Trigger confetti effect
      if (onConfettiTrigger) {
        onConfettiTrigger();
      }
      
      // Perform auto-tagging with the complete conversation
      const taggingSuccess = await performAutoTagging(selectedConversationId, messages);
      
      if (!taggingSuccess) {
        console.warn('⚠️ Auto-tagging was not successful, but conversation was marked as understood');
      }
      
    } catch (error) {
      console.error("❌ Failed to update conversation:", error);
      toast({
        title: "エラー",
        description: "理解したことの記録に失敗しました。",
        variant: "destructive",
      });
    }
  }, [selectedConversationId, updateConversation, setConversationUnderstood, onConfettiTrigger, toast, messages, performAutoTagging]);

  return {
    messages,
    setMessages,
    isLoading,
    isTagging,
    handleSendMessage,
    handleUnderstood,
  };
};
