
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useChatStats } from '@/hooks/useChatStats';
import { useStreakData } from '@/hooks/useStreakData';

interface WelcomeScreenState {
  userId: string | null;
  isAuthenticated: boolean;
  isBasicDataLoaded: boolean;
  canShowAdvancedFeatures: boolean;
  errors: string[];
  isLoading: boolean;
}

export const useWelcomeScreenState = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { profile, isLoading: isLoadingProfile } = useProfile();
  const chatStats = useChatStats(userId);
  const { streakData, isLoading: isLoadingStreak, error: streakError, refreshStreak } = useStreakData(userId);

  // ユーザー認証状態を取得
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          setAuthError(error.message);
          setUserId(null);
        } else {
          setUserId(user?.id || null);
          setAuthError(null);
        }
      } catch (err) {
        setAuthError('認証チェック失敗');
        setUserId(null);
      }
    };
    
    getUser();
  }, []);

  // 実際の条件に基づいて状態を計算
  const state = useMemo<WelcomeScreenState>(() => {
    const isAuthenticated = Boolean(userId);
    const errors: string[] = [];
    
    if (authError) errors.push(authError);
    if (chatStats.error) errors.push('統計読み込み失敗');
    if (streakError) errors.push('ストリークデータ失敗');
    
    const isBasicDataLoaded = !isLoadingProfile && !chatStats.isLoading;
    const isLoading = isLoadingProfile || chatStats.isLoading;
    
    // 高度な機能は以下の場合に有効：
    // 1. ユーザーが認証済み
    // 2. 基本データが正常に読み込まれた
    // 3. 重大なエラーが発生していない
    const canShowAdvancedFeatures = 
      isAuthenticated && 
      isBasicDataLoaded && 
      !authError && 
      !chatStats.error;

    return {
      userId,
      isAuthenticated,
      isBasicDataLoaded,
      canShowAdvancedFeatures,
      errors,
      isLoading
    };
  }, [userId, authError, isLoadingProfile, chatStats.isLoading, chatStats.error, streakError]);

  return {
    ...state,
    profile,
    chatStats,
    streakData,
    isLoadingStreak,
    refreshStreak
  };
};
