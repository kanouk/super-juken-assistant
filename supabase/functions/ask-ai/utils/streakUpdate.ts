
// Get current date in JST (Japan Standard Time)
const getJSTDate = () => {
  const now = new Date();
  const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9 hours
  return jstTime.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const updateUserStreak = async (supabaseClient: any, userId: string) => {
  try {
    const today = getJSTDate(); // Use JST instead of UTC
    console.log(`🗾 Updating streak for user ${userId} on JST date: ${today}`);
    
    // Get current streak data
    const { data: streakData, error: fetchError } = await supabaseClient
      .from('learning_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Error fetching streak data:', fetchError);
      return;
    }

    console.log('📊 Current streak data:', streakData);

    if (!streakData) {
      // Create initial streak record
      console.log('🆕 Creating initial streak record for new user');
      const { error: insertError } = await supabaseClient
        .from('learning_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          streak_start_date: today
        });
      
      if (insertError) {
        console.error('❌ Error creating initial streak:', insertError);
      } else {
        console.log('✅ Initial streak record created successfully');
      }
      return;
    }

    // Check if user already studied today
    if (streakData.last_activity_date === today) {
      console.log('ℹ️ User has already studied today, no streak update needed');
      return; // No update needed
    }

    let newCurrentStreak = streakData.current_streak;
    let newStreakStartDate = streakData.streak_start_date;

    if (!streakData.last_activity_date) {
      // First time studying
      console.log('🎯 First time studying - starting streak');
      newCurrentStreak = 1;
      newStreakStartDate = today;
    } else {
      const lastDate = new Date(streakData.last_activity_date + 'T00:00:00.000Z');
      const todayDate = new Date(today + 'T00:00:00.000Z');
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📅 Last activity: ${streakData.last_activity_date}, Today: ${today}, Days diff: ${daysDiff}`);

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newCurrentStreak = streakData.current_streak + 1;
        console.log(`🔥 Consecutive day! Streak increased to ${newCurrentStreak}`);
      } else if (daysDiff > 1) {
        // Streak broken - restart
        newCurrentStreak = 1;
        newStreakStartDate = today;
        console.log(`💔 Streak broken after ${daysDiff} days gap. Restarting at 1`);
      }
    }

    const newLongestStreak = Math.max(streakData.longest_streak, newCurrentStreak);

    console.log(`📈 Updating streak: current=${newCurrentStreak}, longest=${newLongestStreak}`);

    // Update streak data
    const { error: updateError } = await supabaseClient
      .from('learning_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        streak_start_date: newStreakStartDate
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating streak:', updateError);
    } else {
      console.log('✅ Streak updated successfully');
    }

  } catch (error) {
    console.error('💥 Error updating streak:', error);
  }
};
