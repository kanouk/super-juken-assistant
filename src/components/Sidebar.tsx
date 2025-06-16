import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BookOpen, Calculator, FlaskConical, Atom, Languages, 
  Settings, GraduationCap, LogOut, MapPin, Monitor, Plus,
  User, Clock, TrendingUp, Sparkles, ChevronDown, ChevronUp, CheckCircle, RefreshCw,
  Globe, AlertCircle
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/useSettings";
import { useChatStats } from "@/hooks/useChatStats";
import { supabase } from "@/integrations/supabase/client";
import SidebarStatItem from "./sidebar/SidebarStatItem";
import SidebarStatItemWithDiff from "./sidebar/SidebarStatItemWithDiff";
import SidebarSectionHeader from "./sidebar/SidebarSectionHeader";
import SidebarSubjectButton from "./sidebar/SidebarSubjectButton";

interface SidebarProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  dailyQuestions: number;
  totalCost: number;
  understoodCount: number;
  dailyCostProp: number;
  isLoadingStats: boolean;
}

const Sidebar = ({ 
  selectedSubject, 
  onSubjectChange, 
  onSettingsClick, 
  onProfileClick, 
  onLogout, 
  dailyQuestions, 
  totalCost,
  understoodCount,
  dailyCostProp,
  isLoadingStats
}: SidebarProps) => {
  const { profile, isLoading: isLoadingProfile } = useProfile();
  const { settings } = useSettings();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);
  
  const chatStats = useChatStats(userId);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({
    subjects: true, // Default to open
    countdown: true,
    stats: true,
  });

  // Get visible and sorted subjects from settings
  const visibleSubjects = settings.subjectConfigs
    .filter(config => config.visible)
    .sort((a, b) => a.order - b.order);

  // レガシーデータ：旧教科定義
  const legacySubjects = [
    { id: 'math', name: '数学', icon: Calculator, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', gradient: 'from-blue-400 to-blue-600' },
    { id: 'chemistry', name: '化学', icon: FlaskConical, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', gradient: 'from-purple-400 to-purple-600' },
    { id: 'biology', name: '生物', icon: Atom, color: 'bg-green-100 text-green-700 hover:bg-green-200', gradient: 'from-green-400 to-green-600' },
    { id: 'english', name: '英語', icon: Languages, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', gradient: 'from-indigo-400 to-indigo-600' },
    { id: 'japanese', name: '国語', icon: BookOpen, color: 'bg-red-100 text-red-700 hover:bg-red-200', gradient: 'from-red-400 to-red-600' },
    { id: 'geography', name: '地理', icon: MapPin, color: 'bg-teal-100 text-teal-700 hover:bg-teal-200', gradient: 'from-teal-400 to-teal-600' },
    { id: 'information', name: '情報', icon: Monitor, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200', gradient: 'from-gray-400 to-gray-600' },
    { id: 'other', name: '全般', icon: Plus, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', gradient: 'from-orange-400 to-orange-600' },
    // 新しく追加された科目もここで用意しておく
    { id: 'physics', name: '物理', icon: Atom, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', gradient: 'from-orange-400 to-orange-600' },
    { id: 'japanese_history', name: '日本史', icon: BookOpen, color: 'bg-pink-100 text-pink-700 hover:bg-pink-200', gradient: 'from-pink-400 to-pink-600' },
    { id: 'world_history', name: '世界史', icon: BookOpen, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200', gradient: 'from-amber-400 to-amber-600' },
    { id: 'earth_science', name: '地学', icon: Globe, color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200', gradient: 'from-cyan-400 to-cyan-600' },
  ];

  // どの教科も必ずnameとiconを取れるようにする
  const displaySubjects = visibleSubjects.map(config => {
    const legacyData = legacySubjects.find(s => s.id === config.id);
    return {
      id: config.id,
      name: config.name && config.name.length > 0 ? config.name : (legacyData?.name || config.id),
      icon: legacyData?.icon || Plus,
      color: legacyData?.color || 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      gradient: legacyData?.gradient || 'from-gray-400 to-gray-600'
    };
  });

  const calculateDaysLeft = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // 有効なゴールがあるかチェック
  const hasValidGoals = () => {
    if (!profile?.exam_settings) return false;
    const { kyotsu, todai } = profile.exam_settings;
    const hasFirstGoal = kyotsu.name.trim() !== '' && kyotsu.date !== '';
    const hasSecondGoal = todai.name.trim() !== '' && todai.date !== '';
    return hasFirstGoal || hasSecondGoal;
  };

  const handleOpenChange = useCallback((id: string, isOpen: boolean) => {
    setOpenCollapsibles(prev => ({ ...prev, [id]: isOpen }));
  }, []);
  
  const CollapsibleSectionHeader = (props: any) => (
    <SidebarSectionHeader
      {...props}
      UpIcon={ChevronUp}
      DownIcon={ChevronDown}
    />
  );

  // 教科ごとの理解数を計算（今はダミーデータを返す）
  const getUnderstoodBySubject = () => {
    const subjectCounts: Record<string, number> = {};
    // TODO: 実際のデータが利用可能になったら実装
    displaySubjects.forEach(subject => {
      subjectCounts[subject.name] = Math.floor(Math.random() * 5); // ダミーデータ
    });
    return subjectCounts;
  };

  const understoodBySubject = getUnderstoodBySubject();

  return (
    <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col h-screen shadow-lg">
      {/* Header - Better margins and sizing */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">受験アシスタント</h1>
            <p className="text-xs text-gray-500">AI学習サポート</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
          <Avatar className="h-7 w-7 border border-gray-200">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xs">
              {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {isLoadingProfile ? (
              <>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-2 w-24" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.display_name || 'ユーザー'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email || 'メール未設定'}
                </p>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileClick}
            className="p-1.5 hover:bg-blue-100 rounded-md"
          >
            <User className="h-3 w-3 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Subjects Section */}
        <Collapsible open={openCollapsibles['subjects']} onOpenChange={(isOpen) => handleOpenChange('subjects', isOpen)}>
          <CollapsibleTrigger className="w-full">
            <CollapsibleSectionHeader title="教科選択" icon={BookOpen} iconBgColor="bg-gradient-to-r from-blue-500 to-indigo-600" isOpen={openCollapsibles['subjects']} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {displaySubjects.map((subjectItem) => (
              <SidebarSubjectButton
                key={subjectItem.id}
                id={subjectItem.id}
                name={subjectItem.name}
                Icon={subjectItem.icon}
                color={subjectItem.color}
                gradient={subjectItem.gradient}
                isSelected={selectedSubject === subjectItem.id}
                onClick={onSubjectChange}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Countdown Section */}
        {(!isLoadingProfile && profile?.show_countdown) && (
          <Collapsible open={openCollapsibles['countdown']} onOpenChange={(isOpen) => handleOpenChange('countdown', isOpen)}>
            <CollapsibleTrigger className="w-full">
              <CollapsibleSectionHeader title="入試カウントダウン" icon={Clock} iconBgColor="bg-gradient-to-r from-red-500 to-pink-600" isOpen={openCollapsibles['countdown']} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
              {!hasValidGoals() ? (
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ゴールが設定されていません
                    </p>
                    <p className="text-xs text-yellow-700 mb-3">
                      プロフィール設定で目標とする試験を設定してください
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onProfileClick}
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      設定する
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {profile?.exam_settings?.kyotsu?.name && profile?.exam_settings?.kyotsu?.date && (
                    <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 flex items-center space-x-2">
                          <span>{profile.exam_settings.kyotsu.name}まで</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold text-red-800">
                          {calculateDaysLeft(profile.exam_settings.kyotsu.date)}日
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          {profile.exam_settings.kyotsu.date}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {profile?.exam_settings?.todai?.name && profile?.exam_settings?.todai?.date && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center space-x-2">
                          <span>{profile.exam_settings.todai.name}まで</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold text-blue-800">
                          {calculateDaysLeft(profile.exam_settings.todai.date)}日
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {profile.exam_settings.todai.date}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Stats Section */}
        <Collapsible open={openCollapsibles['stats']} onOpenChange={(isOpen) => handleOpenChange('stats', isOpen)}>
          <CollapsibleTrigger className="w-full">
            <CollapsibleSectionHeader title="学習統計" icon={TrendingUp} iconBgColor="bg-gradient-to-r from-green-500 to-emerald-600" isOpen={openCollapsibles['stats']} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <SidebarStatItemWithDiff 
                      label="本日理解した数" 
                      value={chatStats.today_understood || 0}
                      diff={chatStats.understoodDiff}
                      isLoading={isLoadingStats}
                      icon={CheckCircle}
                      iconColor="text-green-600"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">教科別本日理解数：</p>
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
            
            <SidebarStatItemWithDiff 
              label="本日の質問数" 
              value={chatStats.dailyQuestions} 
              diff={chatStats.questionsDiff}
              isLoading={isLoadingStats}
              icon={User}
              iconColor="text-blue-600"
            />
            <SidebarStatItem 
              label="本日のコスト" 
              value={`¥${chatStats.dailyCost.toFixed(2)}`}
              isLoading={isLoadingStats}
              icon={Sparkles}
              iconColor="text-purple-600"
            />
            <SidebarStatItem 
              label="累計コスト" 
              value={`¥${chatStats.totalCost.toFixed(2)}`}
              isLoading={isLoadingStats}
              icon={RefreshCw}
              iconColor="text-orange-600"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Separator />

      {/* Settings and Logout */}
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start hover:bg-gray-50 border-gray-200"
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4 mr-3" />
          設定
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          ログアウト
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
