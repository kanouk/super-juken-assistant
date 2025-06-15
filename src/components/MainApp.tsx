
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatScreen from './ChatScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useChatStats } from '@/hooks/useChatStats';
import { useIsMobile } from '@/hooks/use-mobile';
import type { User } from '@supabase/supabase-js';

const MainApp = () => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [currentView, setCurrentView] = useState<'chat' | 'settings' | 'profile'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);
  
  const { 
    understoodCount, 
    dailyCost, 
    totalCost, 
    dailyQuestions, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useChatStats(currentUser?.id);

  useEffect(() => {
    if (statsError) {
      toast({
        title: "統計データの取得エラー",
        description: "統計データの取得に失敗しました: " + statsError.message,
        variant: "destructive",
      });
    }
  }, [statsError, toast]);

  const subjectNames: { [key: string]: string } = {
    math: '数学',
    chemistry: '化学',
    biology: '生物',
    english: '英語',
    japanese: '国語',
    geography: '地理',
    information: '情報',
    other: 'その他'
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentView('chat');
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleProfileClick = () => {
    setCurrentView('profile');
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "ログアウト完了",
        description: "ログアウトしました。",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "エラー",
        description: "ログアウトに失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        h-full
      `}>
        <Sidebar
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          onSettingsClick={handleSettingsClick}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
          dailyQuestions={dailyQuestions}
          totalCost={totalCost}
          understoodCount={understoodCount}
          dailyCostProp={dailyCost}
          isLoadingStats={isLoadingStats}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {currentView === 'chat' ? (
          <ChatScreen
            subject={selectedSubject}
            subjectName={subjectNames[selectedSubject]}
            currentModel="GPT-4o"
            userId={currentUser?.id}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
          />
        ) : currentView === 'settings' ? (
          <SettingsScreen 
            onBack={handleBackToChat}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
          />
        ) : (
          <ProfileScreen 
            onBack={handleBackToChat}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default MainApp;
