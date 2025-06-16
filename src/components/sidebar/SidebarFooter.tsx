
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SidebarFooterProps {
  onNavigate: (screen: string) => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ onNavigate }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Separator />
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start hover:bg-gray-50 border-gray-200"
          onClick={() => onNavigate('settings')}
        >
          <Settings className="h-4 w-4 mr-3" />
          設定
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          ログアウト
        </Button>
      </div>
    </>
  );
};

export default SidebarFooter;
