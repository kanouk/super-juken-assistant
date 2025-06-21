
import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, Settings, User } from "lucide-react";

interface SidebarNavigationSectionProps {
  onNavigate: (screen: string) => void;
}

const SidebarNavigationSection: React.FC<SidebarNavigationSectionProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 space-y-2">
      <Button
        onClick={() => onNavigate('welcome')}
        variant="ghost"
        className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <Home className="h-4 w-4 mr-3" />
        ホーム
      </Button>
      <Button
        onClick={() => onNavigate('profile')}
        variant="ghost"
        className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <User className="h-4 w-4 mr-3" />
        プロフィール
      </Button>
      <Button
        onClick={() => onNavigate('settings')}
        variant="ghost"
        className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
      >
        <Settings className="h-4 w-4 mr-3" />
        設定
      </Button>
    </div>
  );
};

export default SidebarNavigationSection;
