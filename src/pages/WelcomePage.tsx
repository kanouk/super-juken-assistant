
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleSubjectSelect = (subject: string) => {
    console.log('Subject selected:', subject);
    navigate(`/app/chat/${subject}`);
  };

  const handleOpenConversation = (conversationId: string, subject: string) => {
    console.log('Opening conversation:', conversationId, subject);
    navigate(`/app/chat/${subject}/${conversationId}`);
  };

  const handleToggleSidebar = () => {
    // This will be handled by AppLayout in the future
    console.log('Toggle sidebar from welcome page');
  };

  return (
    <WelcomeScreen
      onSubjectSelect={handleSubjectSelect}
      onOpenConversation={handleOpenConversation}
      onToggleSidebar={handleToggleSidebar}
      isMobile={window.innerWidth < 1024}
      dailyQuestions={0} // Will be passed from parent
      understoodCount={0} // Will be passed from parent
    />
  );
};

export default WelcomePage;
