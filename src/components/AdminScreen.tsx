
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { TagManagementTab } from "./admin/TagManagementTab";
import TaggingStatusTab from "./admin/TaggingStatusTab";
import { ApiKeysTab } from "./admin/ApiKeysTab";
import { GeneralSettingsTab } from "./admin/GeneralSettingsTab";
import { InstructionSettingsTab } from "./admin/InstructionSettingsTab";
import { ModelsSettingsTab } from "./admin/ModelsSettingsTab";
import { MbtiInstructionsTab } from "./admin/MbtiInstructionsTab";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState("users");
  const { settings, updateSetting, saveSettings, isLoading } = useAdminSettings();

  const handleSave = async () => {
    await saveSettings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AdminHeader onSave={handleSave} isSaving={isLoading} />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="users">ユーザー</TabsTrigger>
            <TabsTrigger value="tags">タグ管理</TabsTrigger>
            <TabsTrigger value="tagging-status">タグ状況</TabsTrigger>
            <TabsTrigger value="api-keys">APIキー</TabsTrigger>
            <TabsTrigger value="general">一般設定</TabsTrigger>
            <TabsTrigger value="instructions">指示設定</TabsTrigger>
            <TabsTrigger value="models">モデル設定</TabsTrigger>
            <TabsTrigger value="mbti">MBTI設定</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>
          
          <TabsContent value="tags">
            <TagManagementTab />
          </TabsContent>

          <TabsContent value="tagging-status">
            <TaggingStatusTab />
          </TabsContent>
          
          <TabsContent value="api-keys">
            <ApiKeysTab settings={settings} updateSetting={updateSetting} />
          </TabsContent>
          
          <TabsContent value="general">
            <GeneralSettingsTab settings={settings} updateSetting={updateSetting} />
          </TabsContent>
          
          <TabsContent value="instructions">
            <InstructionSettingsTab settings={settings} updateSetting={updateSetting} />
          </TabsContent>
          
          <TabsContent value="models">
            <ModelsSettingsTab settings={settings} updateSetting={updateSetting} />
          </TabsContent>
          
          <TabsContent value="mbti">
            <MbtiInstructionsTab mbtiInstructions={settings.mbti_instructions} updateSetting={updateSetting} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminScreen;
