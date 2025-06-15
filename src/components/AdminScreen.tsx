
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AdminHeader } from './admin/AdminHeader';
import { GeneralSettingsTab } from './admin/GeneralSettingsTab';
import { ApiKeysTab } from './admin/ApiKeysTab';
import { ModelsSettingsTab } from './admin/ModelsSettingsTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { MbtiInstructionsTab } from './admin/MbtiInstructionsTab';

const AdminScreen = () => {
  const { settings, updateSetting, saveSettings, isLoading } = useAdminSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings();
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <AdminHeader 
          onSave={handleSave}
          isSaving={isSaving}
        />

        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border-2 border-gray-100">
            <TabsTrigger value="general" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              全般設定
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              APIキー設定
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              モデル設定
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              管理者ユーザー
            </TabsTrigger>
            <TabsTrigger value="mbti" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              性格タイプ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettingsTab 
              settings={settings}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="api">
            <ApiKeysTab 
              settings={settings}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="models">
            <ModelsSettingsTab 
              settings={settings}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="mbti">
            <MbtiInstructionsTab 
              mbtiInstructions={settings.mbti_instructions || {}}
              updateSetting={updateSetting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminScreen;
