
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from './types';

export function useConversations(userId: string | undefined, subject: string) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationUnderstood, setConversationUnderstood] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 会話リスト
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', userId, subject],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('is_understood')
        .eq('id', conversationId)
        .single();

      if (conversationError) throw conversationError;

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // ここでmodel, costも含めて整形 - Message型に統一
      const formattedMessages: Message[] = messagesData.map((msg) => ({
        id: msg.id?.toString?.() ?? '',
        db_id: msg.id,
        content: msg.content,
        role: msg.role === 'user' ? 'user' : 'assistant',
        created_at: msg.created_at,
        timestamp: msg.created_at,
        subject: msg.subject || subject,
        image_url: msg.image_url || undefined,
        model: msg.model || undefined,
        cost: typeof msg.cost === 'number' ? msg.cost : undefined,
        is_understood: msg.is_understood,
        conversation_id: conversationId,
      }));

      setSelectedConversationId(conversationId);
      setConversationUnderstood(conversationData.is_understood || false);

      return formattedMessages;
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "会話の読み込みに失敗しました。",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setConversationUnderstood(false); // 削除時も理解状態をリセット
      }

      refetchConversations();
      toast({
        title: "削除完了",
        description: "会話が削除されました。",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "会話の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 新規会話開始時の状態リセット関数を追加
  const resetConversationState = () => {
    console.log('Resetting conversation state');
    setSelectedConversationId(null);
    setConversationUnderstood(false);
  };

  return {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    conversationUnderstood,
    setConversationUnderstood,
    refetchConversations,
    handleSelectConversation,
    handleDeleteConversation,
    resetConversationState,
  };
}
