
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, X, User } from "lucide-react";
import { UserProfile } from '@/types/profile';

interface SidebarHeaderProps {
  profile: UserProfile | null;
  isMobile: boolean;
  onCloseSidebar: () => void;
  onNavigate: (screen: string) => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  profile,
  isMobile,
  onCloseSidebar,
  onNavigate
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">スーパー受験アシスタント</h1>
            <p className="text-xs text-gray-500">AI学習サポート</p>
          </div>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-md"
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        )}
      </div>

      {/* User Profile Section */}
      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
        <Avatar className="h-7 w-7 border border-gray-200">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xs">
            {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {profile?.display_name || 'ユーザー'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {profile?.email || 'メール未設定'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('profile')}
          className="p-1.5 hover:bg-blue-100 rounded-md"
        >
          <User className="h-3 w-3 text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
