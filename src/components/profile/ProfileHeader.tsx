
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Save } from "lucide-react";

interface ProfileHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onBack, onSave, isSaving }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>戻る</span>
          </Button>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">プロフィール設定</h1>
          </div>
        </div>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
