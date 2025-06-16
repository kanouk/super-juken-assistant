
import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { UserProfile } from '@/types/profile';
import { supabase } from "@/integrations/supabase/client";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarSubjectsSection from "./sidebar/SidebarSubjectsSection";
import SidebarCountdownSection from "./sidebar/SidebarCountdownSection";
import SidebarStatsSection from "./sidebar/SidebarStatsSection";
import SidebarFooter from "./sidebar/SidebarFooter";
import { getDisplaySubjects } from "./sidebar/sidebarUtils";
import { legacySubjects } from "./sidebar/legacySubjects";

interface SidebarProps {
  profile: UserProfile | null;
  settings: any;
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
  isOpen?: boolean;
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
  isOpen = true
}: SidebarProps) => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({
    subjects: true,
    countdown: true,
    stats: true,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const displaySubjects = getDisplaySubjects(settings, legacySubjects);

  const handleOpenChange = useCallback((id: string, isOpen: boolean) => {
    setOpenCollapsibles(prev => ({ ...prev, [id]: isOpen }));
  }, []);

  const handleToggleClick = () => {
    console.log('Toggle button clicked, current isOpen:', isOpen);
    onToggleSidebar();
  };

  return (
    <div className={`${isOpen ? 'w-80' : 'w-12'} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col h-screen shadow-lg transition-all duration-300 relative`}>
      {/* Toggle Button - Fixed positioning */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleClick}
        className={`absolute ${isOpen ? '-right-3' : '-right-3'} top-4 z-50 w-6 h-6 p-0 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-all duration-300`}
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </Button>

      {isOpen && (
        <>
          <SidebarHeader
            profile={profile}
            isMobile={isMobile}
            onCloseSidebar={onToggleSidebar}
            onNavigate={onNavigate}
          />

          {/* Content Sections */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <SidebarSubjectsSection
              displaySubjects={displaySubjects}
              isOpen={openCollapsibles['subjects']}
              onOpenChange={(isOpen) => handleOpenChange('subjects', isOpen)}
              onSubjectSelect={onSubjectSelect}
            />

            <SidebarCountdownSection
              profile={profile}
              isOpen={openCollapsibles['countdown']}
              onOpenChange={(isOpen) => handleOpenChange('countdown', isOpen)}
              onNavigate={onNavigate}
            />

            <SidebarStatsSection
              profile={profile}
              dailyQuestions={dailyQuestions}
              understoodCount={understoodCount}
              questionsDiff={questionsDiff}
              understoodDiff={understoodDiff}
              isStatsLoading={isStatsLoading}
              displaySubjects={displaySubjects}
              isOpen={openCollapsibles['stats']}
              onOpenChange={(isOpen) => handleOpenChange('stats', isOpen)}
            />
          </div>

          <SidebarFooter onNavigate={onNavigate} />
        </>
      )}

      {/* Collapsed state */}
      {!isOpen && (
        <div className="p-2 flex flex-col items-center space-y-2 mt-12">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
