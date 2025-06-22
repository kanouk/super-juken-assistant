
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useWelcomeScreenState } from '@/hooks/useWelcomeScreenState';

const WelcomePage = () => {
  const navigate = useNavigate();
  const welcomeState = useWelcomeScreenState();

  const handleSubjectSelect = (subject: string) => {
    console.log('教科選択:', subject);
    navigate(`/app/chat/${subject}`);
  };

  const handleOpenConversation = (conversationId: string, subject: string) => {
    console.log('会話オープン:', conversationId, subject);
    navigate(`/app/chat/${subject}/${conversationId}`);
  };

  const handleToggleSidebar = () => {
    // 将来AppLayoutで処理される予定
    console.log('ウェルカムページからサイドバートグル');
  };

  return (
    <WelcomeScreen
      onSubjectSelect={handleSubjectSelect}
      onOpenConversation={handleOpenConversation}
      onToggleSidebar={handleToggleSidebar}
      isMobile={window.innerWidth < 1024}
      dailyQuestions={welcomeState.chatStats.dailyQuestions}
      understoodCount={welcomeState.chatStats.today_understood || 0}
      welcomeState={welcomeState}
    />
  );
};

export default WelcomePage;
