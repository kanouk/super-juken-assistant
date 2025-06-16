
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ChatStats {
  understoodCount: number;
  dailyCost: number;
  totalCost: number;
  dailyQuestions: number;
  totalQuestions: number;
  today_understood?: number;
  understood_by_subject?: Record<string, number>;
  yesterdayUnderstoodCount?: number;
  yesterdayQuestionsCount?: number;
  understoodDiff?: number;
  questionsDiff?: number;
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
    totalQuestions: 0,
    today_understood: 0,
    understood_by_subject: {},
    yesterdayUnderstoodCount: 0,
    yesterdayQuestionsCount: 0,
    understoodDiff: 0,
    questionsDiff: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setError(null);

      // 正確な日付範囲を設定
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const dayAfterYesterday = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000);

      const todayStart = today.toISOString();
      const todayEnd = tomorrow.toISOString();
      const yesterdayStart = yesterday.toISOString();
      const yesterdayEnd = dayAfterYesterday.toISOString();

      console.log('Date ranges:', {
        todayStart,
        todayEnd,
        yesterdayStart,
        yesterdayEnd
      });

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
          totalQuestions: 0,
          today_understood: 0,
          understood_by_subject: {},
          yesterdayUnderstoodCount: 0,
          yesterdayQuestionsCount: 0,
          understoodDiff: 0,
          questionsDiff: 0,
        });
        setIsLoading(false);
        return;
      }

      // 本日理解した数（understood_atベース）
      const { count: todayUnderstoodCount, error: todayUnderstoodError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_understood', true)
        .gte('understood_at', todayStart)
        .lt('understood_at', todayEnd);
      if (todayUnderstoodError) throw todayUnderstoodError;

      // 昨日理解した数
      const { count: yesterdayUnderstoodCount, error: yesterdayUnderstoodError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_understood', true)
        .gte('understood_at', yesterdayStart)
        .lt('understood_at', yesterdayEnd);
      if (yesterdayUnderstoodError) throw yesterdayUnderstoodError;

      // 累計理解した数
      const { count: totalUnderstoodCount, error: totalUnderstoodError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_understood', true);
      if (totalUnderstoodError) throw totalUnderstoodError;

      const { data: totalCostData, error: totalCostError } = await supabase
        .from('messages')
        .select('cost')
        .in('conversation_id', conversationIds);
      if (totalCostError) throw totalCostError;

      // 全てのユーザーメッセージ数を取得
      const { count: totalQuestionsCount, error: totalQuestionsError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
        .in('conversation_id', conversationIds);
      if (totalQuestionsError) throw totalQuestionsError;

      const { data: todayData, error: todayError } = await supabase
        .from('messages')
        .select('cost, role')
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd)
        .in('conversation_id', conversationIds);
      if (todayError) throw todayError;

      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from('messages')
        .select('role')
        .gte('created_at', yesterdayStart)
        .lt('created_at', yesterdayEnd)
        .in('conversation_id', conversationIds);
      if (yesterdayError) throw yesterdayError;

      const totalCost = totalCostData?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;
      const dailyCost = todayData?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;
      const dailyQuestions = todayData?.filter(msg => msg.role === 'user').length || 0;
      const yesterdayQuestions = yesterdayData?.filter(msg => msg.role === 'user').length || 0;

      const understoodDiff = (todayUnderstoodCount || 0) - (yesterdayUnderstoodCount || 0);
      const questionsDiff = dailyQuestions - yesterdayQuestions;

      console.log('Stats calculated:', {
        todayUnderstoodCount,
        yesterdayUnderstoodCount,
        totalUnderstoodCount,
        understoodDiff,
        questionsDiff
      });

      setStats({
        understoodCount: totalUnderstoodCount || 0,
        dailyCost,
        totalCost,
        dailyQuestions,
        totalQuestions: totalQuestionsCount || 0,
        today_understood: todayUnderstoodCount || 0,
        understood_by_subject: {},
        yesterdayUnderstoodCount: yesterdayUnderstoodCount || 0,
        yesterdayQuestionsCount: yesterdayQuestions,
        understoodDiff,
        questionsDiff,
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

  return {
    ...stats,
    isLoading,
    error,
    refetch: fetchStats,
    instanceId: instanceIdRef.current, // デバッグ用
  };
};
