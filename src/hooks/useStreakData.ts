
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
}

// Get current date in JST (Japan Standard Time)
const getJSTDate = () => {
  const now = new Date();
  const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9 hours
  return jstTime.toISOString().split('T')[0]; // YYYY-MM-DD format
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
      console.log('🔄 Fetching streak data for user:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('learning_streaks')
        .select('current_streak, longest_streak, last_activity_date, streak_start_date')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching streak data:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (!data) {
        console.log('🆕 No streak data found, creating initial record');
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
          console.error('❌ Error creating streak data:', insertError);
          setError(insertError.message);
          return;
        }

        console.log('✅ Initial streak record created');
        setStreakData(newData);
      } else {
        console.log('📊 Streak data fetched:', data);
        setStreakData(data);
      }
    } catch (err) {
      console.error('💥 Unexpected error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateStreakOnActivity = useCallback(async () => {
    if (!userId || !streakData) {
      console.log('⚠️ Cannot update streak: missing userId or streakData');
      return;
    }

    const today = getJSTDate(); // Use JST
    const lastActivityDate = streakData.last_activity_date;

    console.log(`🗾 Checking streak update: today=${today}, lastActivity=${lastActivityDate}`);

    if (lastActivityDate === today) {
      console.log('ℹ️ Streak already updated today');
      return;
    }

    let newCurrentStreak = streakData.current_streak;
    let newStreakStartDate = streakData.streak_start_date;

    if (!lastActivityDate) {
      newCurrentStreak = 1;
      newStreakStartDate = today;
      console.log('🎯 First time activity - starting streak');
    } else {
      const lastDate = new Date(lastActivityDate + 'T00:00:00.000Z');
      const todayDate = new Date(today + 'T00:00:00.000Z');
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📅 Days difference: ${daysDiff}`);

      if (daysDiff === 1) {
        newCurrentStreak = streakData.current_streak + 1;
        console.log(`🔥 Consecutive day! New streak: ${newCurrentStreak}`);
      } else if (daysDiff > 1) {
        newCurrentStreak = 1;
        newStreakStartDate = today;
        console.log(`💔 Streak broken. Restarting at 1`);
      }
    }

    const newLongestStreak = Math.max(streakData.longest_streak, newCurrentStreak);

    try {
      console.log(`📈 Updating local streak: current=${newCurrentStreak}, longest=${newLongestStreak}`);
      
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
        console.error('❌ Error updating streak:', error);
        return;
      }

      console.log('✅ Streak updated successfully in database');
      setStreakData(data);
    } catch (err) {
      console.error('💥 Error updating streak:', err);
    }
  }, [userId, streakData]);

  // Set up real-time subscription for streak updates
  useEffect(() => {
    if (!userId) return;

    console.log('👂 Setting up realtime subscription for streak updates');
    
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
          console.log('🔄 Real-time streak update received:', payload.new);
          setStreakData(payload.new as StreakData);
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [userId]);

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
