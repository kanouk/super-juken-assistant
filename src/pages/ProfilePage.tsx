
import { useNavigate } from 'react-router-dom';
import ProfileScreen from '@/components/ProfileScreen';

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app');
  };

  const handleToggleSidebar = () => {
    // This will be handled by AppLayout in the future
    console.log('Toggle sidebar from profile page');
  };

  return (
    <ProfileScreen
      onBack={handleBack}
      onToggleSidebar={handleToggleSidebar}
      isMobile={window.innerWidth < 1024}
    />
  );
};

export default ProfilePage;
