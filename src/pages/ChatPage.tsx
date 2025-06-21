
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

  // Default to 'other' if no subject is provided
  const currentSubject = subject || 'other';

  return (
    <ChatScreen
      subject={currentSubject}
      subjectName={currentSubject}
      conversationId={conversationId}
      onBackToWelcome={handleBackToWelcome}
      isMobile={window.innerWidth < 1024}
    />
  );
};

export default ChatPage;
