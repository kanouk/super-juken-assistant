
import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useWelcomeScreenState } from '@/hooks/useWelcomeScreenState';
import WelcomeScreen from './WelcomeScreen';
import ChatScreen from './ChatScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import Sidebar from './Sidebar';

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

  const { profile } = useProfile();
  const { settings } = useSettings();
  const welcomeState = useWelcomeScreenState();

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

  const handleSubjectSelect = (subject: string) => {
    console.log('Subject selected from sidebar:', subject);
    setChatState({ subject, conversationId: undefined });
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
    console.log('MainApp toggle sidebar, current state:', isSidebarOpen);
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
            onOpenConversation={handleOpenConversation}
            onToggleSidebar={handleToggleSidebar}
            isMobile={isMobile}
            dailyQuestions={welcomeState.chatStats.dailyQuestions}
            understoodCount={welcomeState.chatStats.today_understood || 0}
            welcomeState={welcomeState}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            subject={chatState.subject}
            subjectName={chatState.subject}
            conversationId={chatState.conversationId}
            onBackToWelcome={handleBackToWelcome}
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
          isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'
        }`}
      >
        <Sidebar
          profile={profile}
          settings={settings}
          dailyQuestions={welcomeState.chatStats.dailyQuestions}
          understoodCount={welcomeState.chatStats.today_understood || 0}
          totalQuestions={welcomeState.chatStats.totalQuestions || 0}
          questionsDiff={welcomeState.chatStats.questionsDiff}
          understoodDiff={welcomeState.chatStats.understoodDiff}
          isStatsLoading={welcomeState.chatStats.isLoading}
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
          onSubjectSelect={handleSubjectSelect}
          onOpenConversation={handleOpenConversation}
          onToggleSidebar={handleToggleSidebar}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1">
        {renderScreen()}
      </div>
    </div>
  );
};

export default MainApp;
