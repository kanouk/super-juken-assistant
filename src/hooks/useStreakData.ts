
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
}

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
      const { data, error: fetchError } = await supabase
        .from('learning_streaks')
        .select('current_streak, longest_streak, last_activity_date, streak_start_date')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching streak data:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (!data) {
        // Create initial streak record for new user
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
          console.error('Error creating streak data:', insertError);
          setError(insertError.message);
          return;
        }

        setStreakData(newData);
      } else {
        setStreakData(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateStreakOnActivity = useCallback(async () => {
    if (!userId || !streakData) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = streakData.last_activity_date;

    if (lastActivityDate === today) {
      return;
    }

    let newCurrentStreak = streakData.current_streak;
    let newStreakStartDate = streakData.streak_start_date;

    if (!lastActivityDate) {
      newCurrentStreak = 1;
      newStreakStartDate = today;
    } else {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        newCurrentStreak = streakData.current_streak + 1;
      } else if (daysDiff > 1) {
        newCurrentStreak = 1;
        newStreakStartDate = today;
      }
    }

    const newLongestStreak = Math.max(streakData.longest_streak, newCurrentStreak);

    try {
      const { data, error } = await supabase
        .from('learning_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          streak_start_date: newStreakStartDate
        })
        .eq('user_id', userId)
        .select('current_streak, longest_streak, last_activity_date, streak_start_date')
        .single();

      if (error) {
        console.error('Error updating streak:', error);
        return;
      }

      setStreakData(data);
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  }, [userId, streakData]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  return {
    streakData,
    isLoading,
    error,
    updateStreakOnActivity,
    refetch: fetchStreakData
  };
};
