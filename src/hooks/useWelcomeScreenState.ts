
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
  const { streakData, isLoading: isLoadingStreak, error: streakError } = useStreakData(userId);

  // Get user authentication state
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
        setAuthError('Authentication check failed');
        setUserId(null);
      }
    };
    
    getUser();
  }, []);

  // Calculate state based on actual conditions
  const state = useMemo<WelcomeScreenState>(() => {
    const isAuthenticated = Boolean(userId);
    const errors: string[] = [];
    
    if (authError) errors.push(authError);
    if (chatStats.error) errors.push('Stats loading failed');
    if (streakError) errors.push('Streak data failed');
    
    const isBasicDataLoaded = !isLoadingProfile && !chatStats.isLoading;
    const isLoading = isLoadingProfile || chatStats.isLoading;
    
    // Advanced features are enabled when:
    // 1. User is authenticated
    // 2. Basic data is loaded successfully
    // 3. No critical errors occurred
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
    isLoadingStreak
  };
};
