import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, Calculator, FlaskConical, Atom, Languages, 
  Settings, GraduationCap, LogOut, MapPin, Monitor, Plus,
  User, Clock, TrendingUp, Sparkles, ChevronDown, ChevronUp, CheckCircle, RefreshCw
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/useSettings";

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

const subjects = [
  { id: 'math', name: '数学', icon: Calculator, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', gradient: 'from-blue-400 to-blue-600' },
  { id: 'chemistry', name: '化学', icon: FlaskConical, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', gradient: 'from-purple-400 to-purple-600' },
  { id: 'biology', name: '生物', icon: Atom, color: 'bg-green-100 text-green-700 hover:bg-green-200', gradient: 'from-green-400 to-green-600' },
  { id: 'english', name: '英語', icon: Languages, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', gradient: 'from-indigo-400 to-indigo-600' },
  { id: 'japanese', name: '国語', icon: BookOpen, color: 'bg-red-100 text-red-700 hover:bg-red-200', gradient: 'from-red-400 to-red-600' },
  { id: 'geography', name: '地理', icon: MapPin, color: 'bg-teal-100 text-teal-700 hover:bg-teal-200', gradient: 'from-teal-400 to-teal-600' },
  { id: 'information', name: '情報', icon: Monitor, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200', gradient: 'from-gray-400 to-gray-600' },
  { id: 'other', name: '全般', icon: Plus, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', gradient: 'from-orange-400 to-orange-600' },
];

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

  const handleOpenChange = useCallback((id: string, isOpen: boolean) => {
    setOpenCollapsibles(prev => ({ ...prev, [id]: isOpen }));
  }, []);
  
  const CollapsibleSectionHeader = ({ title, icon: IconComponent, iconBgColor, isOpen }: { title: string, icon: React.ElementType, iconBgColor: string, isOpen: boolean }) => (
    <div className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-2">
        <div className={`p-1 ${iconBgColor} rounded-lg`}>
          <IconComponent className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
    </div>
  );

  const StatItem = ({ label, value, unit, isLoading, icon: Icon, iconColor }: { label: string, value: number | string, unit?: string, isLoading: boolean, icon: React.ElementType, iconColor: string }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-sm text-gray-700 font-medium">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-12" />
      ) : (
        <Badge variant="secondary" className="font-semibold">
          {value}{unit}
        </Badge>
      )}
    </div>
  );

  return (
    <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col h-screen shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">スーパー受験アシスタント</h1>
            <p className="text-sm text-gray-600 mt-1">AIとの対話で効率的に学習</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
          <Avatar className="h-10 w-10 border-2 border-blue-200">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {isLoadingProfile ? (
              <>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
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
            className="p-2 hover:bg-blue-100 rounded-lg"
          >
            <User className="h-4 w-4 text-gray-600" />
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
            {displaySubjects.map((subjectItem) => {
              const Icon = subjectItem.icon;
              const isSelected = selectedSubject === subjectItem.id;
              return (
                <Button
                  key={subjectItem.id}
                  variant="ghost"
                  className={`w-full justify-start h-auto p-4 transition-all duration-200 ${
                    isSelected 
                      ? `bg-gradient-to-r ${subjectItem.gradient} text-white shadow-lg transform scale-105` 
                      : `${subjectItem.color} border border-transparent hover:border-gray-300 hover:shadow-md`
                  }`}
                  onClick={() => onSubjectChange(subjectItem.id)}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                    isSelected ? "bg-white/20" : "bg-white shadow-sm"
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? "text-white" : ""
                    }`} />
                  </div>
                  <span className="font-medium text-sm">{subjectItem.name}</span>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Countdown Section */}
        {(!isLoadingProfile && profile?.show_countdown) && (
          <Collapsible open={openCollapsibles['countdown']} onOpenChange={(isOpen) => handleOpenChange('countdown', isOpen)}>
            <CollapsibleTrigger className="w-full">
              <CollapsibleSectionHeader title="入試カウントダウン" icon={Clock} iconBgColor="bg-gradient-to-r from-red-500 to-pink-600" isOpen={openCollapsibles['countdown']} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-700 flex items-center space-x-2">
                    <span>{profile?.exam_settings?.kyotsu?.name || '共通テスト'}まで</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-red-800">
                    {calculateDaysLeft(profile?.exam_settings?.kyotsu?.date || '2026-01-17')}日
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    {profile?.exam_settings?.kyotsu?.date || '2026年1月17日'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center space-x-2">
                    <span>{profile?.exam_settings?.todai?.name || '東大二次試験'}まで</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-800">
                    {calculateDaysLeft(profile?.exam_settings?.todai?.date || '2026-02-25')}日
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {profile?.exam_settings?.todai?.date || '2026年2月25日'}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Stats Section */}
        <Collapsible open={openCollapsibles['stats']} onOpenChange={(isOpen) => handleOpenChange('stats', isOpen)}>
          <CollapsibleTrigger className="w-full">
            <CollapsibleSectionHeader title="学習統計" icon={TrendingUp} iconBgColor="bg-gradient-to-r from-green-500 to-emerald-600" isOpen={openCollapsibles['stats']} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-3">
            <StatItem 
              label="完全に理解した数" 
              value={understoodCount} 
              isLoading={isLoadingStats}
              icon={CheckCircle}
              iconColor="text-green-600"
            />
            <StatItem 
              label="本日の質問数" 
              value={dailyQuestions} 
              isLoading={isLoadingStats}
              icon={User}
              iconColor="text-blue-600"
            />
            <StatItem 
              label="本日のコスト" 
              value={`¥${dailyCostProp.toFixed(2)}`}
              isLoading={isLoadingStats}
              icon={Sparkles}
              iconColor="text-purple-600"
            />
            <StatItem 
              label="累計コスト" 
              value={`¥${totalCost.toFixed(2)}`}
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
