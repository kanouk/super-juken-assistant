
import { useNavigate } from 'react-router-dom';
import SettingsScreen from '@/components/SettingsScreen';

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app');
  };

  const handleToggleSidebar = () => {
    // This will be handled by AppLayout in the future
    console.log('Toggle sidebar from settings page');
  };

  return (
    <SettingsScreen
      onBack={handleBack}
      onToggleSidebar={handleToggleSidebar}
      isMobile={window.innerWidth < 1024}
    />
  );
};

export default SettingsPage;
