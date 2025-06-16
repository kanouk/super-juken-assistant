
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  is_understood: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  subject: string;
  timestamp: string;
  image_url?: string;
  model?: string;
  cost?: number;
  db_id?: string;
  conversation_id?: string;
  is_understood?: boolean;
}

export const useChatHistory = (subject: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

  const loadConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [subject]);

  const createConversation = async (title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .insert([{ title, subject, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      await loadConversations();
      return data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const updateConversation = async (id: string, title?: string | null, isUnderstood?: boolean) => {
    try {
      const updateData: any = {};
      if (title !== null && title !== undefined) {
        updateData.title = title;
      }
      if (isUnderstood !== undefined) {
        updateData.is_understood = isUnderstood;
      }

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await loadConversations();
    } catch (error) {
      console.error('Failed to update conversation:', error);
      throw error;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Failed to load messages:', error);
      return { data: [], error };
    }
  };

  return {
    conversations,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    loadMessages,
  };
};
