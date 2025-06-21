
import { useParams, useNavigate } from 'react-router-dom';
import ChatScreen from '@/components/ChatScreen';
import { legacySubjects } from '@/components/sidebar/legacySubjects';

const ChatPage = () => {
  const { subject, conversationId } = useParams<{ 
    subject?: string; 
    conversationId?: string; 
  }>();
  const navigate = useNavigate();

  const handleBackToWelcome = () => {
    navigate('/app');
  };

  const handleNavigateToConversation = (newSubject: string, newConversationId?: string) => {
    if (newConversationId) {
      navigate(`/app/chat/${newSubject}/${newConversationId}`);
    } else {
      navigate(`/app/chat/${newSubject}`);
    }
  };

  // Default to 'other' if no subject is provided
  const currentSubject = subject || 'other';
  
  // Get the proper subject name from legacySubjects
  const subjectConfig = legacySubjects.find(s => s.id === currentSubject);
  const subjectName = subjectConfig?.name || 'その他';

  return (
    <ChatScreen
      subject={currentSubject}
      subjectName={subjectName}
      conversationId={conversationId}
      onBackToWelcome={handleBackToWelcome}
      onNavigateToConversation={handleNavigateToConversation}
      isMobile={window.innerWidth < 1024}
    />
  );
};

export default ChatPage;
