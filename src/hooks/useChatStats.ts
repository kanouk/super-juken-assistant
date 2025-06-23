
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

// TypeScript interfaces for better type safety
interface MessageWithCost {
  cost?: number;
  role?: string;
}

// グローバルなインスタンスカウンタ（デバッグ用）
let chatStatsInstanceId = 0;

export const useChatStats = (userId: string | undefined) => {
  // インスタンス固有IDでトラッキング
  const instanceIdRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  if (instanceIdRef.current === 0) {
    chatStatsInstanceId++;
    instanceIdRef.current = chatStatsInstanceId;
  }

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
    if (!userId || !isMountedRef.current) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }
    
    try {
      if (!isMountedRef.current) return;
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

      if (!isMountedRef.current) return;

      if (conversationsError) {
        console.warn('⚠️ 会話データ取得エラー（非致命的）:', conversationsError);
        // エラーでもデフォルト値で続行
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
        setError(null);
        return;
      }

      const conversationIds = conversations?.map(conv => conv.id) || [];
      if (conversationIds.length === 0) {
        if (!isMountedRef.current) return;
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

      // 各統計データを安全に取得
      const promises = [
        // 本日理解した数
        supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_understood', true)
          .gte('understood_at', todayStart)
          .lt('understood_at', todayEnd),
        
        // 昨日理解した数
        supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_understood', true)
          .gte('understood_at', yesterdayStart)
          .lt('understood_at', yesterdayEnd),
        
        // 累計理解した数
        supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_understood', true),
        
        // コストデータ
        supabase
          .from('messages')
          .select('cost')
          .in('conversation_id', conversationIds),
        
        // 全質問数
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user')
          .in('conversation_id', conversationIds),
        
        // 今日のデータ
        supabase
          .from('messages')
          .select('cost, role')
          .gte('created_at', todayStart)
          .lt('created_at', todayEnd)
          .in('conversation_id', conversationIds),
        
        // 昨日のデータ
        supabase
          .from('messages')
          .select('role')
          .gte('created_at', yesterdayStart)
          .lt('created_at', yesterdayEnd)
          .in('conversation_id', conversationIds)
      ];

      const results = await Promise.allSettled(promises);
      
      if (!isMountedRef.current) return;

      // 結果を安全に処理
      const todayUnderstoodCount = results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0;
      const yesterdayUnderstoodCount = results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0;
      const totalUnderstoodCount = results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0;
      const totalCostData = results[3].status === 'fulfilled' ? (results[3].value.data as MessageWithCost[]) || [] : [];
      const totalQuestionsCount = results[4].status === 'fulfilled' ? results[4].value.count || 0 : 0;
      const todayData = results[5].status === 'fulfilled' ? (results[5].value.data as MessageWithCost[]) || [] : [];
      const yesterdayData = results[6].status === 'fulfilled' ? (results[6].value.data as MessageWithCost[]) || [] : [];

      // Type-safe calculations
      const totalCost = totalCostData.reduce((sum, msg) => sum + (msg.cost || 0), 0);
      const dailyCost = todayData.reduce((sum, msg) => sum + (msg.cost || 0), 0);
      const dailyQuestions = todayData.filter(msg => msg.role === 'user').length;
      const yesterdayQuestions = yesterdayData.filter(msg => msg.role === 'user').length;

      const understoodDiff = todayUnderstoodCount - yesterdayUnderstoodCount;
      const questionsDiff = dailyQuestions - yesterdayQuestions;

      console.log('Stats calculated safely:', {
        todayUnderstoodCount,
        yesterdayUnderstoodCount,
        totalUnderstoodCount,
        understoodDiff,
        questionsDiff
      });

      setStats({
        understoodCount: totalUnderstoodCount,
        dailyCost,
        totalCost,
        dailyQuestions,
        totalQuestions: totalQuestionsCount,
        today_understood: todayUnderstoodCount,
        understood_by_subject: {},
        yesterdayUnderstoodCount,
        yesterdayQuestionsCount: yesterdayQuestions,
        understoodDiff,
        questionsDiff,
      });
    } catch (err) {
      if (!isMountedRef.current) return;
      console.warn('⚠️ 統計取得で予期しないエラー（非致命的）:', err);
      // エラーでもデフォルト値で続行
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
      setError(null);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
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
