
import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatScreen from './ChatScreen';
import SettingsScreen from './SettingsScreen';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const MainApp = () => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [dailyQuestions] = useState(12);
  const [totalCost] = useState(2.45);
  const { toast } = useToast();
  const navigate = useNavigate();

  const subjectNames: { [key: string]: string } = {
    math: '数学',
    english: '英語',
    science: '理科',
    social: '社会',
    physics: '物理',
    history: '歴史'
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentView('chat');
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
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
        onLogout={handleLogout}
        dailyQuestions={dailyQuestions}
        totalCost={totalCost}
      />
      
      <div className="flex-1">
        {currentView === 'chat' ? (
          <ChatScreen
            subject={selectedSubject}
            subjectName={subjectNames[selectedSubject]}
            currentModel="GPT-4o"
          />
        ) : (
          <SettingsScreen onBack={handleBackToChat} />
        )}
      </div>
    </div>
  );
};

export default MainApp;
