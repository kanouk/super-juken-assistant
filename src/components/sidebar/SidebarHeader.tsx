
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from '@/types/profile';
import { Settings, X } from "lucide-react";

interface SidebarHeaderProps {
  profile: UserProfile | null;
  isMobile: boolean;
  onToggleSidebar: () => void;
  onNavigate: (screen: string) => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  profile,
  isMobile,
  onToggleSidebar,
  onNavigate
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {profile?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {profile?.display_name || 'ユーザー'}
            </h2>
            <p className="text-sm text-gray-500 truncate">学習進捗を確認</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('profile')}
            className="h-8 w-8 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
