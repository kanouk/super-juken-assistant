
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

  // welcomeStateが完全に初期化されていない場合の安全な処理
  const safeChatStats = welcomeState.chatStats || { dailyQuestions: 0 };
  const safeUnderstoodCount = welcomeState.chatStats?.today_understood || 0;

  return (
    <WelcomeScreen
      onSubjectSelect={handleSubjectSelect}
      onOpenConversation={handleOpenConversation}
      onToggleSidebar={handleToggleSidebar}
      isMobile={window.innerWidth < 1024}
      dailyQuestions={safeChatStats.dailyQuestions || 0}
      understoodCount={safeUnderstoodCount}
      welcomeState={welcomeState}
    />
  );
};

export default WelcomePage;
