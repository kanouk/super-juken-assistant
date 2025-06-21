
import React, { useState } from 'react';
import { UserProfile } from '@/types/profile';
import { SettingsType } from '@/types/settings';
import { Separator } from "@/components/ui/separator";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavigationSection from "./sidebar/SidebarNavigationSection";
import SidebarStatsSection from "./sidebar/SidebarStatsSection";
import SidebarCountdownSection from "./sidebar/SidebarCountdownSection";
import SidebarSubjectsSection from "./sidebar/SidebarSubjectsSection";
import SidebarFooter from "./sidebar/SidebarFooter";
import { getDisplaySubjects } from "./sidebar/sidebarUtils";

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
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(true); // Changed to true (default open)

  // 設定から表示する教科リストを取得
  const displaySubjects = getDisplaySubjects(settings);

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-lg">
      <SidebarHeader 
        profile={profile}
        isMobile={isMobile}
        onToggleSidebar={onToggleSidebar}
        onNavigate={onNavigate}
      />
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <SidebarNavigationSection onNavigate={onNavigate} />
        
        <Separator />

        {/* Reordered: Subjects first */}
        <div className="p-4">
          <SidebarSubjectsSection
            displaySubjects={displaySubjects}
            isOpen={isSubjectsOpen}
            onOpenChange={setIsSubjectsOpen}
            onSubjectSelect={onSubjectSelect}
          />
        </div>

        <Separator />

        {/* Then countdown */}
        <div className="p-4">
          <SidebarCountdownSection
            profile={profile}
            isOpen={isCountdownOpen}
            onOpenChange={setIsCountdownOpen}
            onNavigate={onNavigate}
          />
        </div>

        <Separator />

        {/* Finally stats */}
        <SidebarStatsSection
          dailyQuestions={dailyQuestions}
          understoodCount={understoodCount}
          totalQuestions={totalQuestions}
          questionsDiff={questionsDiff}
          understoodDiff={understoodDiff}
          isStatsLoading={isStatsLoading}
        />
      </div>

      <SidebarFooter />
    </div>
  );
};

export default Sidebar;
