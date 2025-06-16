
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useChatStats } from '@/hooks/useChatStats';
import WelcomeScreen from './WelcomeScreen';
import ChatScreen from './ChatScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import Sidebar from './Sidebar';
import { supabase } from '@/integrations/supabase/client';

type Screen = 'welcome' | 'chat' | 'settings' | 'profile';

interface ChatState {
  subject: string;
  conversationId?: string;
}

const MainApp = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [chatState, setChatState] = useState<ChatState>({ subject: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const { profile } = useProfile();
  const { settings } = useSettings();
  const chatStats = useChatStats(userId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const handleSubjectSelect = (subject: string) => {
    setChatState({ subject });
    setCurrentScreen('chat');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
    setChatState({ subject: '' });
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenConversation = (conversationId: string, subject: string) => {
    setChatState({ subject, conversationId });
    setCurrentScreen('chat');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onSubjectSelect={handleSubjectSelect}
            onToggleSidebar={handleToggleSidebar}
            isMobile={isMobile}
            dailyQuestions={chatStats.dailyQuestions}
            understoodCount={chatStats.understoodCount}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            subject={chatState.subject}
            subjectName={chatState.subject}
            userId={userId}
            conversationId={chatState.conversationId}
            onBackToWelcome={handleBackToWelcome}
            onToggleSidebar={handleToggleSidebar}
            isMobile={isMobile}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={handleBackToWelcome}
            onToggleSidebar={handleToggleSidebar}
            isMobile={isMobile}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onBack={handleBackToWelcome}
            onToggleSidebar={handleToggleSidebar}
            isMobile={isMobile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out ${
          isMobile ? 'fixed inset-y-0 left-0 z-50 w-80' : 'relative'
        } ${isMobile ? '' : isSidebarOpen ? 'w-80' : 'w-0'}`}
      >
        {(isSidebarOpen || !isMobile) && (
          <Sidebar
            profile={profile}
            settings={settings}
            dailyQuestions={chatStats.dailyQuestions}
            understoodCount={chatStats.today_understood || 0}
            totalQuestions={chatStats.totalQuestions || 0}
            questionsDiff={chatStats.questionsDiff}
            understoodDiff={chatStats.understoodDiff}
            isStatsLoading={chatStats.isLoading}
            onNavigate={(screen) => setCurrentScreen(screen as Screen)}
            onSubjectSelect={handleSubjectSelect}
            onOpenConversation={handleOpenConversation}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
        {renderScreen()}
      </div>
    </div>
  );
};

export default MainApp;
