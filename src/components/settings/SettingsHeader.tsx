
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";

interface SettingsHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const SettingsHeader = ({ onBack, onSave, isSaving }: SettingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            設定
          </h1>
          <p className="text-gray-600">システム設定を管理</p>
        </div>
      </div>
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-2 hover:bg-gray-50"
        >
          戻る
        </Button>
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  );
};
