
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const isMountedRef = useRef(true);
  const authInitializedRef = useRef(false);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { profile, isLoading: isLoadingProfile } = useProfile();
  const chatStats = useChatStats(userId);
  const { streakData, isLoading: isLoadingStreak, error: streakError, refreshStreak } = useStreakData(userId);

  // ユーザー認証状態を取得（重複防止・安全性向上）
  useEffect(() => {
    if (authInitializedRef.current) return;
    
    let isCancelled = false;

    const initializeAuth = async () => {
      try {
        console.log('🔐 認証状態初期化開始');
        
        // 既存セッション確認
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (isCancelled || !isMountedRef.current) return;
        
        if (sessionError) {
          console.warn('セッション取得エラー（非致命的）:', sessionError.message);
          setAuthError(null);
          setUserId(null);
        } else {
          console.log('💻 既存セッション:', session ? 'あり' : 'なし');
          setUserId(session?.user?.id || null);
          setAuthError(null);
        }

        // 認証状態変更の監視（重複防止）
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMountedRef.current) return;
            console.log('🔄 認証状態変更:', event);
            setUserId(session?.user?.id || null);
            setAuthError(null);
          }
        );

        authInitializedRef.current = true;

        return () => {
          isCancelled = true;
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } catch (err) {
        if (isCancelled || !isMountedRef.current) return;
        console.warn('認証初期化エラー（非致命的）:', err);
        setAuthError(null);
        setUserId(null);
        authInitializedRef.current = true;
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, []);

  // 実際の条件に基づいて状態を計算（フォールバック強化）
  const state = useMemo<WelcomeScreenState>(() => {
    const isAuthenticated = Boolean(userId);
    const errors: string[] = [];
    
    // エラーは記録するが、致命的にしない
    if (authError) {
      console.warn('Auth error logged:', authError);
    }
    if (chatStats.error) {
      console.warn('Chat stats error logged:', chatStats.error);
    }
    if (streakError) {
      console.warn('Streak error logged:', streakError);
    }
    
    const isBasicDataLoaded = !isLoadingProfile && !chatStats.isLoading;
    const isLoading = isLoadingProfile || chatStats.isLoading;
    
    // 高度な機能は認証とデータ読み込み完了時に有効
    const canShowAdvancedFeatures = isAuthenticated && isBasicDataLoaded;

    return {
      userId,
      isAuthenticated,
      isBasicDataLoaded,
      canShowAdvancedFeatures,
      errors,
      isLoading
    };
  }, [userId, authError, isLoadingProfile, chatStats.isLoading, chatStats.error, streakError]);

  // 安全なデータ返却（フォールバック値付き）
  return {
    ...state,
    profile: profile || null,
    chatStats: {
      ...chatStats,
      understoodCount: chatStats.understoodCount || 0,
      dailyQuestions: chatStats.dailyQuestions || 0,
      totalQuestions: chatStats.totalQuestions || 0,
      today_understood: chatStats.today_understood || 0,
      understoodDiff: chatStats.understoodDiff || 0,
      questionsDiff: chatStats.questionsDiff || 0,
    },
    streakData: streakData || { current_streak: 0, longest_streak: 0, last_activity_date: null, streak_start_date: null },
    isLoadingStreak: isLoadingStreak || false,
    refreshStreak: refreshStreak || (() => {})
  };
};
