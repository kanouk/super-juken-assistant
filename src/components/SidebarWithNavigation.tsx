
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useChatStats } from '@/hooks/useChatStats';
import Sidebar from './Sidebar';

interface SidebarWithNavigationProps {
  onToggleSidebar: () => void;
  isMobile: boolean;
  isOpen: boolean;
  userId?: string;
}

const SidebarWithNavigation: React.FC<SidebarWithNavigationProps> = ({
  onToggleSidebar,
  isMobile,
  isOpen,
  userId
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const { settings } = useSettings();
  const chatStats = useChatStats(userId);

  const handleNavigate = (screen: string) => {
    switch (screen) {
      case 'welcome':
        navigate('/app');
        break;
      case 'settings':
        navigate('/app/settings');
        break;
      case 'profile':
        navigate('/app/profile');
        break;
      default:
        navigate('/app');
    }
    
    if (isMobile) {
      // Close sidebar on mobile after navigation
      setTimeout(() => onToggleSidebar(), 100);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    console.log('Subject selected:', subject);
    navigate(`/app/chat/${subject}`);
    
    if (isMobile) {
      // Close sidebar on mobile after navigation
      setTimeout(() => onToggleSidebar(), 100);
    }
  };

  const handleOpenConversation = (conversationId: string, subject: string) => {
    console.log('Opening conversation:', conversationId, subject);
    navigate(`/app/chat/${subject}/${conversationId}`);
    
    if (isMobile) {
      // Close sidebar on mobile after navigation
      setTimeout(() => onToggleSidebar(), 100);
    }
  };

  return (
    <Sidebar
      profile={profile}
      settings={settings}
      dailyQuestions={chatStats.dailyQuestions}
      understoodCount={chatStats.today_understood || 0}
      totalQuestions={chatStats.totalQuestions || 0}
      questionsDiff={chatStats.questionsDiff}
      understoodDiff={chatStats.understoodDiff}
      isStatsLoading={chatStats.isLoading}
      onNavigate={handleNavigate}
      onSubjectSelect={handleSubjectSelect}
      onOpenConversation={handleOpenConversation}
      onToggleSidebar={onToggleSidebar}
      isMobile={isMobile}
      isOpen={isOpen}
    />
  );
};

export default SidebarWithNavigation;
