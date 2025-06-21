
export const updateUserStreak = async (supabaseClient: any, userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get current streak data
    const { data: streakData, error: fetchError } = await supabaseClient
      .from('learning_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching streak data:', fetchError);
      return;
    }

    if (!streakData) {
      // Create initial streak record
      await supabaseClient
        .from('learning_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          streak_start_date: today
        });
      return;
    }

    // Check if user already studied today
    if (streakData.last_activity_date === today) {
      return; // No update needed
    }

    let newCurrentStreak = streakData.current_streak;
    let newStreakStartDate = streakData.streak_start_date;

    if (!streakData.last_activity_date) {
      // First time studying
      newCurrentStreak = 1;
      newStreakStartDate = today;
    } else {
      const lastDate = new Date(streakData.last_activity_date);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newCurrentStreak = streakData.current_streak + 1;
      } else if (daysDiff > 1) {
        // Streak broken - restart
        newCurrentStreak = 1;
        newStreakStartDate = today;
      }
    }

    const newLongestStreak = Math.max(streakData.longest_streak, newCurrentStreak);

    // Update streak data
    await supabaseClient
      .from('learning_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        streak_start_date: newStreakStartDate
      })
      .eq('user_id', userId);

  } catch (error) {
    console.error('Error updating streak:', error);
  }
};
