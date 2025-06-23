
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStreakData = useCallback(async () => {
    if (!userId || !isMountedRef.current) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (!isMountedRef.current) return;
      setError(null);
      console.log('🔄 ストリークデータを取得中 - User:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('learning_streaks')
        .select('current_streak, longest_streak, last_activity_date, streak_start_date')
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMountedRef.current) return;

      if (fetchError) {
        console.warn('⚠️ ストリークデータ取得エラー（非致命的）:', fetchError);
        // エラーでもデフォルト値を設定して続行
        setStreakData({
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null,
          streak_start_date: null
        });
        setError(null); // エラーを無視
        return;
      }

      if (!data) {
        console.log('🆕 ストリークデータなし、初期記録作成');
        try {
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

          if (!isMountedRef.current) return;

          if (insertError) {
            console.warn('⚠️ ストリークデータ作成エラー（非致命的）:', insertError);
            // 作成に失敗してもデフォルト値で続行
            setStreakData({
              current_streak: 0,
              longest_streak: 0,
              last_activity_date: null,
              streak_start_date: null
            });
            setError(null);
            return;
          }

          console.log('✅ 初期ストリーク記録作成完了');
          setStreakData(newData);
        } catch (insertErr) {
          if (!isMountedRef.current) return;
          console.warn('⚠️ ストリーク作成で予期しないエラー（非致命的）:', insertErr);
          setStreakData({
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null,
            streak_start_date: null
          });
          setError(null);
        }
      } else {
        console.log('📊 ストリークデータ取得完了:', data);
        setStreakData(data);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.warn('⚠️ ストリーク処理で予期しないエラー（非致命的）:', err);
      // 予期しないエラーでもデフォルト値で続行
      setStreakData({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_start_date: null
      });
      setError(null);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  // リアルタイム購読設定でストリーク更新を監視（エラー処理強化）
  useEffect(() => {
    if (!userId || !isMountedRef.current) return;

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
          if (!isMountedRef.current) return;
          console.log('🔄 リアルタイムストリーク更新受信:', payload.new);
          try {
            setStreakData(payload.new as StreakData);
          } catch (err) {
            console.warn('⚠️ リアルタイム更新処理エラー（非致命的）:', err);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 リアルタイム購読クリーンアップ');
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('⚠️ チャンネルクリーンアップエラー（非致命的）:', err);
      }
    };
  }, [userId]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  const refreshStreak = useCallback(() => {
    if (!isMountedRef.current) return;
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
