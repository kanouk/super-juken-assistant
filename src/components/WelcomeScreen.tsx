
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BookOpen, GraduationCap, Sparkles, 
  Target, TrendingUp, User, CheckCircle
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useChatStats } from "@/hooks/useChatStats";
import { useStreakData } from "@/hooks/useStreakData";
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./stats/StatCard";
import UnderstoodUnits from "./UnderstoodUnits";
import StreakDisplay from "./streak/StreakDisplay";
import LearningCalendar from "./calendar/LearningCalendar";

interface WelcomeScreenProps {
  onSubjectSelect: (subject: string) => void;
  onOpenConversation: (conversationId: string, subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  dailyQuestions: number;
  understoodCount: number;
}

const WelcomeScreen = ({ 
  onSubjectSelect, 
  onOpenConversation,
  onToggleSidebar, 
  isMobile, 
  dailyQuestions, 
  understoodCount 
}: WelcomeScreenProps) => {
  const { profile, isLoading: isLoadingProfile } = useProfile();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(false);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
      // 5秒後に高度な機能を有効化（段階的復旧）
      setTimeout(() => {
        setEnableAdvancedFeatures(true);
      }, 5000);
    };
    getUser();
  }, []);
  
  const chatStats = useChatStats(userId);
  const { streakData, isLoading: isLoadingStreak } = useStreakData(enableAdvancedFeatures ? userId : undefined);

  const getUnderstoodBySubject = () => {
    const subjectCounts: Record<string, number> = {};
    return subjectCounts;
  };

  const understoodBySubject = getUnderstoodBySubject();

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ようこそ！</h1>
            <p className="text-sm text-gray-600">学習の成果を確認してください</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Streak Display - 条件付きレンダリング */}
        {enableAdvancedFeatures && (
          <StreakDisplay
            currentStreak={streakData?.current_streak || 0}
            longestStreak={streakData?.longest_streak || 0}
            isLoading={isLoadingStreak}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <StatCard
                    title="本日理解した数"
                    value={chatStats.today_understood || 0}
                    diff={chatStats.understoodDiff}
                    isLoading={chatStats.isLoading}
                    icon={CheckCircle}
                    iconColor="text-green-600"
                    cardColor="bg-green-50"
                    borderColor="border-green-200"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">今日理解した内容：</p>
                  {Object.entries(understoodBySubject).length > 0 ? (
                    Object.entries(understoodBySubject).map(([subject, count]) => (
                      <p key={subject} className="text-sm">{subject}: {String(count)}個</p>
                    ))
                  ) : (
                    <p className="text-sm">まだ理解した内容がありません</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <StatCard
                    title="累計理解した数"
                    value={chatStats.understoodCount}
                    isLoading={chatStats.isLoading}
                    icon={Target}
                    iconColor="text-blue-600"
                    cardColor="bg-blue-50"
                    borderColor="border-blue-200"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">教科別累計理解数：</p>
                  {Object.entries(understoodBySubject).length > 0 ? (
                    Object.entries(understoodBySubject).map(([subject, count]) => (
                      <p key={subject} className="text-sm">{subject}: {String(count)}個</p>
                    ))
                  ) : (
                    <p className="text-sm">まだ理解した内容がありません</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <StatCard
            title="本日の質問数"
            value={chatStats.dailyQuestions}
            diff={chatStats.questionsDiff}
            isLoading={chatStats.isLoading}
            icon={TrendingUp}
            iconColor="text-purple-600"
            cardColor="bg-purple-50"
            borderColor="border-purple-200"
          />

          <StatCard
            title="累計質問数"
            value={chatStats.totalQuestions || 0}
            isLoading={chatStats.isLoading}
            icon={User}
            iconColor="text-orange-600"
            cardColor="bg-orange-50"
            borderColor="border-orange-200"
          />
        </div>

        {/* Learning Calendar - 条件付きレンダリング */}
        {enableAdvancedFeatures && <LearningCalendar userId={userId} />}

        {/* Understood Units */}
        <UnderstoodUnits onOpenConversation={onOpenConversation} />
      </div>
    </div>
  );
};

export default WelcomeScreen;
