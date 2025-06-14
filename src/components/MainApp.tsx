import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatScreen from './ChatScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useChatStats } from '@/hooks/useChatStats';
import type { User } from '@supabase/supabase-js';

const MainApp = () => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [currentView, setCurrentView] = useState<'chat' | 'settings' | 'profile'>('chat');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  const handleProfileClick = () => {
    setCurrentView('profile');
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
    <div className="flex h-screen bg-gray-50">
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
      
      <div className="flex-1">
        {currentView === 'chat' ? (
          <ChatScreen
            subject={selectedSubject}
            subjectName={subjectNames[selectedSubject]}
            currentModel="GPT-4o"
            userId={currentUser?.id}
          />
        ) : currentView === 'settings' ? (
          <SettingsScreen onBack={handleBackToChat} />
        ) : (
          <ProfileScreen onBack={handleBackToChat} />
        )}
      </div>
    </div>
  );
};

export default MainApp;
