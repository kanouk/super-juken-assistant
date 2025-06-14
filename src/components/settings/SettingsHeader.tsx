
import { Button } from "@/components/ui/button";
import { Settings, Save, Menu } from "lucide-react";

interface SettingsHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  onToggleSidebar?: () => void;
  isMobile?: boolean;
}

export const SettingsHeader = ({ onBack, onSave, isSaving, onToggleSidebar, isMobile }: SettingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6 lg:mb-8 px-3 lg:px-0">
      <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
        {isMobile && onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 flex-shrink-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Settings className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent truncate">
            設定
          </h1>
          <p className="text-sm lg:text-base text-gray-600 hidden sm:block">システム設定を管理</p>
        </div>
      </div>
      <div className="flex space-x-2 lg:space-x-3 flex-shrink-0">
        <Button 
          variant="outline" 
          onClick={onBack}
          size="sm"
          className="border-2 hover:bg-gray-50"
        >
          戻る
        </Button>
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          <Save className="h-4 w-4 mr-1 lg:mr-2" />
          <span className="hidden sm:inline">{isSaving ? '保存中...' : '保存'}</span>
          <span className="sm:hidden">{isSaving ? '...' : '保存'}</span>
        </Button>
      </div>
    </div>
  );
};
