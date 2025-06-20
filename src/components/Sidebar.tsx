
import React, { useState } from 'react';
import { Home, Settings, User, ChevronDown, ChevronUp, Bot, X, BookOpen, BarChart3 } from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { SettingsType } from '@/types/settings';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SidebarCountdownSection from "./sidebar/SidebarCountdownSection";

interface SidebarProps {
  profile: UserProfile | null;
  settings: SettingsType | null;
  dailyQuestions: number;
  understoodCount: number;
  totalQuestions: number;
  questionsDiff: number;
  understoodDiff: number;
  isStatsLoading: boolean;
  onNavigate: (screen: string) => void;
  onSubjectSelect: (subject: string) => void;
  onOpenConversation: (conversationId: string, subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  isOpen: boolean;
}

const subjects = [
  { name: '数学', id: 'math', icon: BookOpen, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600' },
  { name: '英語', id: 'english', icon: BookOpen, color: 'from-green-500 to-green-600', textColor: 'text-green-600' },
  { name: '理科', id: 'science', icon: BookOpen, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-600' },
  { name: '社会', id: 'social', icon: BookOpen, color: 'from-orange-500 to-orange-600', textColor: 'text-orange-600' },
  { name: '物理', id: 'physics', icon: BookOpen, color: 'from-red-500 to-red-600', textColor: 'text-red-600' },
  { name: '歴史', id: 'history', icon: BookOpen, color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600' },
];

const SidebarHeader = ({ onToggleSidebar, profile, isMobile, onNavigate }: { onToggleSidebar: () => void, profile: UserProfile | null, isMobile: boolean, onNavigate: (screen: string) => void }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">スーパー受験アシスタント</h1>
            <p className="text-sm text-white/80">学習アシスタント</p>
          </div>
        </div>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* User Profile Card */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-white/30">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-white/20 text-white font-semibold">
                {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {profile?.display_name || 'ユーザー'}
              </p>
              <p className="text-xs text-white/70 truncate">
                {profile?.email || 'メール未設定'}
              </p>
              {profile?.plan && (
                <Badge variant="secondary" className="mt-1 text-xs bg-white/20 text-white border-white/30">
                  {profile.plan === 'free' ? 'フリー' : profile.plan === 'one_time' ? '買い切り' : 'プレミアム'}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('profile')}
              className="text-white hover:bg-white/20 p-2"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatsSection = ({ dailyQuestions, understoodCount, totalQuestions, questionsDiff, understoodDiff, isStatsLoading }: { dailyQuestions: number, understoodCount: number, totalQuestions: number, questionsDiff: number, understoodDiff: number, isStatsLoading: boolean }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <BarChart3 className="h-4 w-4 text-emerald-600" />
        <h3 className="font-semibold text-gray-800">今日の学習</h3>
      </div>
      
      {isStatsLoading ? (
        <div className="space-y-2">
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">質問数</p>
                  <p className="text-2xl font-bold text-blue-800">{dailyQuestions}</p>
                </div>
                <div className="text-right">
                  <span className={cn("text-sm font-medium", questionsDiff >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {questionsDiff >= 0 ? `+${questionsDiff}` : questionsDiff}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 font-medium">理解度</p>
                  <p className="text-2xl font-bold text-emerald-800">{understoodCount}</p>
                </div>
                <div className="text-right">
                  <span className={cn("text-sm font-medium", understoodDiff >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {understoodDiff >= 0 ? `+${understoodDiff}` : understoodDiff}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">累計質問</p>
                  <p className="text-2xl font-bold text-purple-800">{totalQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const SubjectsSection = ({ onSubjectSelect }: { onSubjectSelect: (subject: string) => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSubjectClick = (subject: string) => {
    onSubjectSelect(subject);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">科目を選択</h3>
        </div>
        {isCollapsed ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronUp className="h-4 w-4 text-gray-500" />}
      </div>
      
      {!isCollapsed && (
        <div className="grid grid-cols-2 gap-2">
          {subjects.map(subject => (
            <Button
              key={subject.id}
              variant="ghost"
              onClick={() => handleSubjectClick(subject.name)}
              className={`h-auto p-3 flex flex-col items-center space-y-1 bg-gradient-to-br ${subject.color} text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              <subject.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{subject.name}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const NavigationSection = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  return (
    <div className="p-4 space-y-2">
      <Button
        onClick={() => onNavigate('welcome')}
        variant="ghost"
        className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <Home className="h-4 w-4 mr-3" />
        ホーム
      </Button>
      <Button
        onClick={() => onNavigate('settings')}
        variant="ghost"
        className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <Settings className="h-4 w-4 mr-3" />
        設定
      </Button>
    </div>
  );
};

const SidebarFooter = () => {
  return (
    <div className="p-4 text-center text-gray-500 text-xs border-t bg-gray-50">
      <p>© 2024 スーパー受験アシスタント</p>
    </div>
  );
};

const Sidebar = ({
  profile,
  settings,
  dailyQuestions,
  understoodCount,
  totalQuestions,
  questionsDiff,
  understoodDiff,
  isStatsLoading,
  onNavigate,
  onSubjectSelect,
  onOpenConversation,
  onToggleSidebar,
  isMobile,
  isOpen
}: SidebarProps) => {
  const [isCountdownOpen, setIsCountdownOpen] = useState(true);

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-lg">
      <SidebarHeader 
        onToggleSidebar={onToggleSidebar} 
        profile={profile}
        isMobile={isMobile}
        onNavigate={onNavigate}
      />
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <NavigationSection onNavigate={onNavigate} />
        
        <Separator />

        <StatsSection
          dailyQuestions={dailyQuestions}
          understoodCount={understoodCount}
          totalQuestions={totalQuestions}
          questionsDiff={questionsDiff}
          understoodDiff={understoodDiff}
          isStatsLoading={isStatsLoading}
        />

        <Separator />

        <div className="p-4">
          <SidebarCountdownSection
            profile={profile}
            isOpen={isCountdownOpen}
            onOpenChange={setIsCountdownOpen}
            onNavigate={onNavigate}
          />
        </div>

        <Separator />

        <SubjectsSection onSubjectSelect={onSubjectSelect} />
      </div>

      <SidebarFooter />
    </div>
  );
};

export default Sidebar;
