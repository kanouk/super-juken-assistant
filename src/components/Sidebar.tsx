
import React, { useState } from 'react';
import { Home, Settings, User, CreditCard, ChevronDown, ChevronUp, Bot, X, MessageSquare, BarChart3, Clock, BookOpen, Calculator, Globe, Atom, History } from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { SettingsType } from '@/types/settings';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  { name: '数学', id: 'math', icon: Calculator, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600' },
  { name: '英語', id: 'english', icon: Globe, color: 'from-green-500 to-green-600', textColor: 'text-green-600' },
  { name: '理科', id: 'science', icon: Atom, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-600' },
  { name: '社会', id: 'social', icon: History, color: 'from-orange-500 to-orange-600', textColor: 'text-orange-600' },
  { name: '物理', id: 'physics', icon: Atom, color: 'from-red-500 to-red-600', textColor: 'text-red-600' },
  { name: '歴史', id: 'history', icon: History, color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600' },
];

const SidebarHeader = ({ onToggleSidebar, profile, isMobile }: { onToggleSidebar: () => void, profile: UserProfile | null, isMobile: boolean }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Tutor</h1>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Countdown = () => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());

  function getTimeRemaining() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(24, 0, 0, 0);
    const difference = endOfDay.getTime() - now.getTime();
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border">
      <Clock className="h-3 w-3 inline mr-1" />
      リセットまで: {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
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
      
      <Countdown />
    </div>
  );
};

const SubjectsSection = ({ onSubjectSelect, onOpenConversation }: { onSubjectSelect: (subject: string) => void, onOpenConversation: (conversationId: string, subject: string) => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSubjectClick = (subject: string) => {
    onSubjectSelect(subject);
  };

  // ダミーの会話履歴データ
  const conversationHistory = [
    { id: '1', subject: '数学', lastMessage: '微分の問題を解きました。' },
    { id: '2', subject: '英語', lastMessage: '長文読解の練習をしました。' },
  ];

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
      
      <Separator />
      
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">会話履歴</h3>
        </div>
        <div className="space-y-2">
          {conversationHistory.map(conversation => (
            <Card key={conversation.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3" onClick={() => onOpenConversation(conversation.id, conversation.subject)}>
                <p className="text-sm font-medium text-gray-800">{conversation.subject}</p>
                <p className="text-xs text-gray-600 truncate">{conversation.lastMessage}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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
      <Button
        onClick={() => onNavigate('profile')}
        variant="ghost"
        className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <User className="h-4 w-4 mr-3" />
        プロフィール
      </Button>
      <Button
        onClick={() => window.location.href = '/billing'}
        variant="ghost"
        className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <CreditCard className="h-4 w-4 mr-3" />
        課金・プラン
      </Button>
    </div>
  );
};

const SidebarFooter = () => {
  return (
    <div className="p-4 text-center text-gray-500 text-xs border-t bg-gray-50">
      <p>© 2024 AI Tutor</p>
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

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-lg">
      <SidebarHeader 
        onToggleSidebar={onToggleSidebar} 
        profile={profile}
        isMobile={isMobile}
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

        <SubjectsSection
          onSubjectSelect={onSubjectSelect}
          onOpenConversation={onOpenConversation}
        />
      </div>

      <SidebarFooter />
    </div>
  );
};

export default Sidebar;
