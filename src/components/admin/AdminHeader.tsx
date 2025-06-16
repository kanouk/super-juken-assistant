
import { Button } from "@/components/ui/button";
import { Save, Shield } from "lucide-react";

interface AdminHeaderProps {
  onSave: () => void;
  isSaving: boolean;
}

export const AdminHeader = ({ onSave, isSaving }: AdminHeaderProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              管理者設定
            </h1>
            <p className="text-gray-600 mt-1">
              サービス全体の設定を管理します
            </p>
          </div>
        </div>
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 min-w-[120px]"
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>保存中...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>設定を保存</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
