
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BookOpen, GraduationCap, Sparkles, 
  Target, TrendingUp, User, CheckCircle
} from "lucide-react";
import StatCard from "./stats/StatCard";
import UnderstoodUnits from "./UnderstoodUnits";
import StreakDisplay from "./streak/StreakDisplay";
import ErrorBoundary from "./ErrorBoundary";

interface WelcomeState {
  userId: string | null;
  isAuthenticated: boolean;
  isBasicDataLoaded: boolean;
  canShowAdvancedFeatures: boolean;
  errors: string[];
  isLoading: boolean;
  profile: any;
  chatStats: any;
  streakData: any;
  isLoadingStreak: boolean;
}

interface WelcomeScreenProps {
  onSubjectSelect: (subject: string) => void;
  onOpenConversation: (conversationId: string, subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  dailyQuestions: number;
  understoodCount: number;
  welcomeState: WelcomeState;
}

const WelcomeScreen = ({ 
  onSubjectSelect, 
  onOpenConversation,
  onToggleSidebar, 
  isMobile, 
  dailyQuestions, 
  understoodCount,
  welcomeState
}: WelcomeScreenProps) => {
  // 安全にデータを取得（フォールバック付き）
  const { 
    userId, 
    canShowAdvancedFeatures, 
    chatStats, 
    streakData, 
    isLoadingStreak,
    errors,
    isLoading 
  } = welcomeState || {};

  // ローディング状態での表示
  if (isLoading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
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
              <h1 className="text-xl font-bold text-gray-900">読み込み中...</h1>
              <p className="text-sm text-gray-600">学習データを準備しています</p>
            </div>
          </div>
        </div>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getUnderstoodBySubject = () => {
    const subjectCounts: Record<string, number> = {};
    return subjectCounts;
  };

  const understoodBySubject = getUnderstoodBySubject();

  // 重大なエラーがある場合のエラーメッセージ表示
  const hasErrors = errors && errors.length > 0;

  // 安全なデータアクセス
  const safeStreakData = streakData || { current_streak: 0, longest_streak: 0 };
  const safeChatStats = chatStats || {
    today_understood: 0,
    understoodCount: 0,
    dailyQuestions: 0,
    totalQuestions: 0,
    understoodDiff: 0,
    questionsDiff: 0,
    isLoading: false
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* ヘッダー */}
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
        {/* エラー表示（ある場合） */}
        {hasErrors && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  一部のデータ読み込みに時間がかかっていますが、基本機能は利用できます。
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ストリーク表示 - エラーバウンダリ付き */}
        {canShowAdvancedFeatures && (
          <ErrorBoundary name="学習ストリーク" fallback={null}>
            <StreakDisplay
              currentStreak={safeStreakData.current_streak || 0}
              longestStreak={safeStreakData.longest_streak || 0}
              isLoading={isLoadingStreak}
            />
          </ErrorBoundary>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <StatCard
                    title="本日理解した数"
                    value={safeChatStats.today_understood || 0}
                    diff={safeChatStats.understoodDiff}
                    isLoading={safeChatStats.isLoading}
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
                    value={safeChatStats.understoodCount || 0}
                    isLoading={safeChatStats.isLoading}
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
            value={safeChatStats.dailyQuestions || 0}
            diff={safeChatStats.questionsDiff}
            isLoading={safeChatStats.isLoading}
            icon={TrendingUp}
            iconColor="text-purple-600"
            cardColor="bg-purple-50"
            borderColor="border-purple-200"
          />

          <StatCard
            title="累計質問数"
            value={safeChatStats.totalQuestions || 0}
            isLoading={safeChatStats.isLoading}
            icon={User}
            iconColor="text-orange-600"
            cardColor="bg-orange-50"
            borderColor="border-orange-200"
          />
        </div>

        {/* 理解済みユニット */}
        <ErrorBoundary name="理解済みユニット" fallback={null}>
          <UnderstoodUnits onOpenConversation={onOpenConversation} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default WelcomeScreen;
