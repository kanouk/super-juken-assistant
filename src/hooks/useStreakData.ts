
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
}

// JST（日本標準時）で現在の日付を取得
const getJSTDate = () => {
  const now = new Date();
  const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9時間
  return jstTime.toISOString().split('T')[0]; // YYYY-MM-DD形式
};

export const useStreakData = (userId?: string) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreakData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('🔄 ストリークデータを取得中 - User:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('learning_streaks')
        .select('current_streak, longest_streak, last_activity_date, streak_start_date')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ ストリークデータ取得エラー:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (!data) {
        console.log('🆕 ストリークデータなし、初期記録作成');
        // 新規ユーザー用の初期ストリーク記録を作成
        const { data: newData, error: insertError } = await supabase
          .from('learning_streaks')
          .insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null,
            streak_start_date: null
          })
          .select('current_streak, longest_streak, last_activity_date, streak_start_date')
          .single();

        if (insertError) {
          console.error('❌ ストリークデータ作成エラー:', insertError);
          setError(insertError.message);
          return;
        }

        console.log('✅ 初期ストリーク記録作成完了');
        setStreakData(newData);
      } else {
        console.log('📊 ストリークデータ取得完了:', data);
        setStreakData(data);
      }
    } catch (err) {
      console.error('💥 予期しないエラー:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // リアルタイム購読設定でストリーク更新を監視
  useEffect(() => {
    if (!userId) return;

    console.log('👂 ストリーク更新のリアルタイム購読設定');
    
    const channel = supabase
      .channel('streak-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'learning_streaks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 リアルタイムストリーク更新受信:', payload.new);
          setStreakData(payload.new as StreakData);
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 リアルタイム購読クリーンアップ');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  const refreshStreak = useCallback(() => {
    console.log('🔄 手動ストリークデータ更新');
    fetchStreakData();
  }, [fetchStreakData]);

  return {
    streakData,
    isLoading,
    error,
    refetch: fetchStreakData,
    refreshStreak
  };
};
