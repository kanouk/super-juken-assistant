
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { startOfDay, isSameDay } from 'date-fns'; // For date comparisons

interface MessageStat {
  cost?: number | null;
  created_at: string;
  is_understood?: boolean | null;
  role: string;
}

interface Stats {
  understoodCount: number;
  dailyCost: number;
  totalCost: number;
  dailyQuestions: number;
  isLoading: boolean;
  error: Error | null;
}

export const useChatStats = (userId: string | undefined): Stats => {
  const fetchMessagesForStats = async (): Promise<MessageStat[]> => {
    if (!userId) return [];

    // 1. Get all conversation IDs for the user
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    if (convError) {
      console.error('Error fetching conversations for stats:', convError);
      throw convError;
    }
    if (!conversations || conversations.length === 0) return [];

    const conversationIds = conversations.map(c => c.id);

    // 2. Get all messages for these conversation IDs
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('cost, created_at, is_understood, role')
      .in('conversation_id', conversationIds);

    if (msgError) {
      console.error('Error fetching messages for stats:', msgError);
      throw msgError;
    }
    return (messages || []).map(m => ({
        cost: m.cost,
        created_at: m.created_at,
        is_understood: m.is_understood,
        role: m.role
    }));
  };

  const { data: messages = [], isLoading, error } = useQuery<MessageStat[], Error>({
    queryKey: ['chatStats', userId],
    queryFn: fetchMessagesForStats,
    enabled: !!userId, // Only run query if userId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const [stats, setStats] = useState<Omit<Stats, 'isLoading' | 'error'>>({
    understoodCount: 0,
    dailyCost: 0,
    totalCost: 0,
    dailyQuestions: 0,
  });

  useEffect(() => {
    if (messages.length > 0) {
      const today = startOfDay(new Date());
      let understood = 0;
      let dailyC = 0;
      let totalC = 0;
      let dailyQ = 0;

      messages.forEach(msg => {
        if (msg.is_understood) {
          understood++;
        }
        if (msg.cost) {
          totalC += msg.cost;
          if (isSameDay(new Date(msg.created_at), today)) {
            dailyC += msg.cost;
          }
        }
        if (msg.role === 'user' && isSameDay(new Date(msg.created_at), today)) {
          dailyQ++;
        }
      });
      
      setStats({
        understoodCount: understood,
        dailyCost: dailyC,
        totalCost: totalC,
        dailyQuestions: dailyQ,
      });
    } else {
      // Reset stats if no messages or user ID changes to undefined
      setStats({
        understoodCount: 0,
        dailyCost: 0,
        totalCost: 0,
        dailyQuestions: 0,
      });
    }
  }, [messages]);

  return { ...stats, isLoading, error };
};
