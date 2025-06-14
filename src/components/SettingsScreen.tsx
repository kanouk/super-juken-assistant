
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/useSettings";
import { PasscodeAuth } from './settings/PasscodeAuth';
import { SettingsHeader } from './settings/SettingsHeader';
import { SecurityTab } from './settings/SecurityTab';
import { ApiTab } from './settings/ApiTab';
import { ModelsTab } from './settings/ModelsTab';
import { GeneralTab } from './settings/GeneralTab';
import { SubjectsTab } from './settings/SubjectsTab';

interface SettingsScreenProps {
  onBack: () => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { settings, setSettings, saveSettings, isLoading } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings(settings);
    setIsSaving(false);
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const moveSubject = (dragIndex: number, hoverIndex: number) => {
    const draggedSubject = settings.subjectConfigs[dragIndex];
    const newSubjects = [...settings.subjectConfigs];
    newSubjects.splice(dragIndex, 1);
    newSubjects.splice(hoverIndex, 0, draggedSubject);
    
    const updatedSubjects = newSubjects.map((subject, index) => ({
      ...subject,
      order: index + 1
    }));
    
    setSettings(prev => ({
      ...prev,
      subjectConfigs: updatedSubjects
    }));
  };

  const updateSubjectConfig = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      subjectConfigs: prev.subjectConfigs.map(config =>
        config.id === id ? { ...config, [field]: value } : config
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <PasscodeAuth
        expectedPasscode={settings.passcode}
        onAuthenticated={() => setIsAuthenticated(true)}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <SettingsHeader 
          onBack={onBack}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <Tabs defaultValue="security" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border-2 border-gray-100">
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              セキュリティ
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              API設定
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              モデル設定
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              全体設定
            </TabsTrigger>
            <TabsTrigger value="subjects" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              教科設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <SecurityTab 
              passcode={settings.passcode}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="api">
            <ApiTab 
              apiKeys={settings.apiKeys}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="models">
            <ModelsTab 
              models={settings.models}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="general">
            <GeneralTab 
              commonInstruction={settings.commonInstruction}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectsTab 
              subjectConfigs={settings.subjectConfigs}
              updateSubjectConfig={updateSubjectConfig}
              moveSubject={moveSubject}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsScreen;
