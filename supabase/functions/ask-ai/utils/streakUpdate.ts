
// JST（日本標準時）で現在の日付を取得
const getJSTDate = () => {
  const now = new Date();
  const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9時間
  return jstTime.toISOString().split('T')[0]; // YYYY-MM-DD形式
};

export const updateUserStreak = async (supabaseClient: any, userId: string) => {
  try {
    const today = getJSTDate(); // JST使用
    console.log(`🗾 JST日付でストリーク更新 - User: ${userId}, Date: ${today}`);
    
    // 現在のストリークデータを取得
    const { data: streakData, error: fetchError } = await supabaseClient
      .from('learning_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ ストリークデータ取得エラー:', fetchError);
      return;
    }

    console.log('📊 現在のストリークデータ:', streakData);

    if (!streakData) {
      // 初回ストリーク記録を作成
      console.log('🆕 新規ユーザーの初期ストリーク記録作成');
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
        console.error('❌ 初期ストリーク作成エラー:', insertError);
      } else {
        console.log('✅ 初期ストリーク記録作成成功');
      }
      return;
    }

    // 今日既に学習済みかチェック
    if (streakData.last_activity_date === today) {
      console.log('ℹ️ 今日は既に学習済み、ストリーク更新不要');
      return; // 更新不要
    }

    let newCurrentStreak = streakData.current_streak;
    let newStreakStartDate = streakData.streak_start_date;

    if (!streakData.last_activity_date) {
      // 初回学習
      console.log('🎯 初回学習 - ストリーク開始');
      newCurrentStreak = 1;
      newStreakStartDate = today;
    } else {
      const lastDate = new Date(streakData.last_activity_date + 'T00:00:00.000Z');
      const todayDate = new Date(today + 'T00:00:00.000Z');
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📅 最終活動: ${streakData.last_activity_date}, 今日: ${today}, 日数差: ${daysDiff}`);

      if (daysDiff === 1) {
        // 連続日 - ストリーク増加
        newCurrentStreak = streakData.current_streak + 1;
        console.log(`🔥 連続日！ストリーク ${newCurrentStreak} に増加`);
      } else if (daysDiff > 1) {
        // ストリーク途切れ - リスタート
        newCurrentStreak = 1;
        newStreakStartDate = today;
        console.log(`💔 ${daysDiff}日間のブランクでストリーク途切れ。1からリスタート`);
      }
    }

    const newLongestStreak = Math.max(streakData.longest_streak, newCurrentStreak);

    console.log(`📈 ストリーク更新: current=${newCurrentStreak}, longest=${newLongestStreak}`);

    // ストリークデータ更新
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
      console.error('❌ ストリーク更新エラー:', updateError);
    } else {
      console.log('✅ ストリーク更新成功');
    }

  } catch (error) {
    console.error('💥 ストリーク更新中のエラー:', error);
  }
};
