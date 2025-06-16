import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AdminHeader } from './admin/AdminHeader';
import { GeneralSettingsTab } from './admin/GeneralSettingsTab';
import { InstructionSettingsTab } from './admin/InstructionSettingsTab';
import { ApiKeysTab } from './admin/ApiKeysTab';
import { ModelsSettingsTab } from './admin/ModelsSettingsTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { TagManagementTab } from './admin/TagManagementTab';

const AdminScreen = () => {
  const { settings, updateSetting, saveSettings, isLoading } = useAdminSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <AdminHeader 
          onSave={handleSave}
          isSaving={isSaving}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-white rounded-xl shadow-lg border-2 border-blue-100">
            <TabsTrigger value="general" className="data-[state=active]:bg-blue-100">
              全般設定
            </TabsTrigger>
            <TabsTrigger value="instructions" className="data-[state=active]:bg-green-100">
              指示設定
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-purple-100">
              モデル設定
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="data-[state=active]:bg-orange-100">
              API設定
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-pink-100">
              ユーザー管理
            </TabsTrigger>
            <TabsTrigger value="tags" className="data-[state=active]:bg-teal-100">
              タグ管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettingsTab 
              settings={settings}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="instructions">
            <InstructionSettingsTab
              settings={settings}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="apikeys">
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

          <TabsContent value="tags">
            <TagManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminScreen;
