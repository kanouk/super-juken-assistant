
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ChatStats {
  understoodCount: number;
  dailyCost: number;
  totalCost: number;
  dailyQuestions: number;
}

// グローバルなインスタンスカウンタ（デバッグ用）
let chatStatsInstanceId = 0;

export const useChatStats = (userId: string | undefined) => {
  // インスタンス固有IDでトラッキング
  const instanceIdRef = useRef<number>(0);
  if (instanceIdRef.current === 0) {
    chatStatsInstanceId++;
    instanceIdRef.current = chatStatsInstanceId;
  }

  const [stats, setStats] = useState<ChatStats>({
    understoodCount: 0,
    dailyCost: 0,
    totalCost: 0,
    dailyQuestions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const channelRef = useRef<any>(null);
  const channelNameRef = useRef<string | null>(null);
  const isSubscribedRef = useRef(false);

  const fetchStats = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setError(null);

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

      const { count: understoodCount, error: understoodError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'assistant')
        .eq('is_understood', true)
        .in('conversation_id', conversationIds);
      if (understoodError) throw understoodError;

      const { data: totalCostData, error: totalCostError } = await supabase
        .from('messages')
        .select('cost')
        .in('conversation_id', conversationIds);
      if (totalCostError) throw totalCostError;

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
      console.error('[ChatStats] Error fetching chat stats:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // userIdが変わるたびfetch
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Realtime購読部分
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    // クリーンアップ: 既存チャンネルを確実に解除
    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe && channelRef.current.unsubscribe();
        console.info(`[useChatStats][${instanceId}] Unsubscribed previous channel:`, channelNameRef.current);
      } catch (e) {
        console.warn(`[useChatStats][${instanceId}] unsubscribe error`, e);
      }
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      channelNameRef.current = null;
      isSubscribedRef.current = false;
    }
    if (!userId) return;

    const channelName = 'chat-stats-changes-' + userId;
    console.info(`[useChatStats][${instanceId}] Creating new channel:`, channelName);

    // 新チャンネル生成&購読
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          console.info(`[useChatStats][${instanceId}] Detected messages change → refetch stats`);
          fetchStats();
        }
      );

    let cleaned = false;
    let subscribed = false;
    channel.subscribe((status: string) => {
      if (cleaned || subscribed) return;
      if (status === 'SUBSCRIBED') {
        channelRef.current = channel;
        channelNameRef.current = channelName;
        isSubscribedRef.current = true;
        subscribed = true;
        console.info(`[useChatStats][${instanceId}] SUBSCRIBED channel:`, channelName);
      }
    });

    // アンマウント時/依存変化時のクリーンアップ
    return () => {
      cleaned = true;
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe && channelRef.current.unsubscribe();
          console.info(`[useChatStats][${instanceId}] Cleanup: unsubscribed channel:`, channelName);
        } catch (e) {
          console.warn(`[useChatStats][${instanceId}] unsubscribe error during cleanup`, e);
        }
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
        channelNameRef.current = null;
        console.info(`[useChatStats][${instanceId}] CLEANED:`, channelName);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    ...stats,
    isLoading,
    error,
    refetch: fetchStats,
    instanceId: instanceIdRef.current, // デバッグ用
  };
};

