import React, { useState } from 'react';
import { Home, Settings, User, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { SettingsType } from '@/types/settings';
import { cn } from "@/lib/utils";

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

const SidebarHeader = ({ onToggleSidebar, profile, isMobile }: { onToggleSidebar: () => void, profile: UserProfile | null, isMobile: boolean }) => {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
      <span className="font-semibold text-lg">AI Tutor</span>
      {isMobile && (
        <button onClick={onToggleSidebar} className="text-gray-600 hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
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
    <div className="text-sm text-gray-600">
      リセットまで: {timeRemaining.hours}時間{timeRemaining.minutes}分{timeRemaining.seconds}秒
    </div>
  );
};

const StatsSection = ({ dailyQuestions, understoodCount, totalQuestions, questionsDiff, understoodDiff, isStatsLoading }: { dailyQuestions: number, understoodCount: number, totalQuestions: number, questionsDiff: number, understoodDiff: number, isStatsLoading: boolean }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-semibold text-gray-700 mb-2">今日の学習</h3>
      {isStatsLoading ? (
        <div className="text-sm text-gray-500">
          Loading stats...
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">質問数:</span>
            <span className="text-sm font-medium text-gray-700">
              {dailyQuestions}
              <span className={cn("ml-1 text-xs", questionsDiff >= 0 ? "text-green-500" : "text-red-500")}>
                {questionsDiff >= 0 ? `+${questionsDiff}` : questionsDiff}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">理解度:</span>
            <span className="text-sm font-medium text-gray-700">
              {understoodCount}
              <span className={cn("ml-1 text-xs", understoodDiff >= 0 ? "text-green-500" : "text-red-500")}>
                {understoodDiff >= 0 ? `+${understoodDiff}` : understoodDiff}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">累計質問数:</span>
            <span className="text-sm font-medium text-gray-700">{totalQuestions}</span>
          </div>
        </div>
      )}
      <Countdown />
    </div>
  );
};

const SubjectsSection = ({ onSubjectSelect, onOpenConversation }: { onSubjectSelect: (subject: string) => void, onOpenConversation: (conversationId: string, subject: string) => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const subjects = [
    { name: '数学', id: 'math' },
    { name: '英語', id: 'english' },
    { name: '理科', id: 'science' },
    { name: '社会', id: 'social' },
    { name: '物理', id: 'physics' },
    { name: '歴史', id: 'history' },
  ];

  const handleSubjectClick = (subject: string) => {
    onSubjectSelect(subject);
  };

  // ダミーの会話履歴データ
  const conversationHistory = [
    { id: '1', subject: '数学', lastMessage: '微分の問題を解きました。' },
    { id: '2', subject: '英語', lastMessage: '長文読解の練習をしました。' },
  ];

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="font-semibold text-gray-700">科目を選択</h3>
        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </div>
      {!isCollapsed && (
        <div className="space-y-2">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => handleSubjectClick(subject.name)}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {subject.name}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4">
        <h3 className="font-semibold text-gray-700 mb-2">会話履歴</h3>
        <div className="space-y-2">
          {conversationHistory.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => onOpenConversation(conversation.id, conversation.subject)}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {conversation.subject} - {conversation.lastMessage}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SidebarFooter = () => {
  return (
    <div className="p-4 text-center text-gray-500 text-xs">
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
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <SidebarHeader 
        onToggleSidebar={onToggleSidebar} 
        profile={profile}
        isMobile={isMobile}
      />
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation Menu */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('welcome')}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              ホーム
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              設定
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              プロフィール
            </button>
            <button
              onClick={() => window.location.href = '/billing'}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              課金・プラン
            </button>
          </div>
        </div>

        <StatsSection
          dailyQuestions={dailyQuestions}
          understoodCount={understoodCount}
          totalQuestions={totalQuestions}
          questionsDiff={questionsDiff}
          understoodDiff={understoodDiff}
          isStatsLoading={isStatsLoading}
        />

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
