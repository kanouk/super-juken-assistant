
import { useParams, useNavigate } from 'react-router-dom';
import ChatScreen from '@/components/ChatScreen';

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

  return (
    <ChatScreen
      subject={currentSubject}
      subjectName={currentSubject}
      conversationId={conversationId}
      onBackToWelcome={handleBackToWelcome}
      onNavigateToConversation={handleNavigateToConversation}
      isMobile={window.innerWidth < 1024}
    />
  );
};

export default ChatPage;
