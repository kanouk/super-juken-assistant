import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ChatStats {
  understoodCount: number;
  dailyCost: number;
  totalCost: number;
  dailyQuestions: number;
}

export const useChatStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<ChatStats>({
    understoodCount: 0,
    dailyCost: 0,
    totalCost: 0,
    dailyQuestions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Realtime channelインスタンスをuseRefで保持（常に1つ）
  const channelRef = useRef<any>(null);

  const fetchStats = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // First, get all conversation IDs for this user
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId);

      if (conversationsError) throw conversationsError;

      const conversationIds = conversations?.map(conv => conv.id) || [];
      
      if (conversationIds.length === 0) {
        setStats({
          understoodCount: 0,
          dailyCost: 0,
          totalCost: 0,
          dailyQuestions: 0,
        });
        setIsLoading(false);
        return;
      }

      // Get understood count - count assistant messages that are marked as understood
      const { count: understoodCount, error: understoodError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'assistant')
        .eq('is_understood', true)
        .in('conversation_id', conversationIds);

      if (understoodError) throw understoodError;

      // Get total cost
      const { data: totalCostData, error: totalCostError } = await supabase
        .from('messages')
        .select('cost')
        .in('conversation_id', conversationIds);

      if (totalCostError) throw totalCostError;

      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error: todayError } = await supabase
        .from('messages')
        .select('cost, role')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .in('conversation_id', conversationIds);

      if (todayError) throw todayError;

      const totalCost = totalCostData?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;
      const dailyCost = todayData?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;
      const dailyQuestions = todayData?.filter(msg => msg.role === 'user').length || 0;

      setStats({
        understoodCount: understoodCount || 0,
        dailyCost,
        totalCost,
        dailyQuestions,
      });
    } catch (err) {
      console.error('Error fetching chat stats:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // 前のチャンネル停止
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // 新しいチャンネル作成
    const channel = supabase
      .channel('chat-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch stats when messages table changes
          fetchStats();
        }
      );

    // ここでサブスクライブは一度だけ呼ぶ
    channel.subscribe();
    channelRef.current = channel;

    // クリーンアップ: 単一チャンネルだけ remove
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // userId のみ依存
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    ...stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
