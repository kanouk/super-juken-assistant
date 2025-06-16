
import React from 'react';
import { Clock, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UserProfile } from '@/types/profile';
import SidebarSectionHeader from "./SidebarSectionHeader";
import { calculateDaysLeft, hasValidGoals } from "./sidebarUtils";

interface SidebarCountdownSectionProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNavigate: (screen: string) => void;
}

const SidebarCountdownSection: React.FC<SidebarCountdownSectionProps> = ({
  profile,
  isOpen,
  onOpenChange,
  onNavigate
}) => {
  const CollapsibleSectionHeader = (props: any) => (
    <SidebarSectionHeader
      {...props}
      UpIcon={ChevronUp}
      DownIcon={ChevronDown}
    />
  );

  if (!profile?.show_countdown) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <CollapsibleSectionHeader 
          title="入試カウントダウン" 
          icon={Clock} 
          iconBgColor="bg-gradient-to-r from-red-500 to-pink-600" 
          isOpen={isOpen} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-3">
        {!hasValidGoals(profile) ? (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ゴールが設定されていません
              </p>
              <p className="text-xs text-yellow-700 mb-3">
                プロフィール設定で目標とする試験を設定してください
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('profile')}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                設定する
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {profile?.exam_settings?.kyotsu?.name && profile?.exam_settings?.kyotsu?.date && (
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-700 flex items-center space-x-2">
                    <span>{profile.exam_settings.kyotsu.name}まで</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-red-800">
                    {calculateDaysLeft(profile.exam_settings.kyotsu.date)}日
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    {profile.exam_settings.kyotsu.date}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile?.exam_settings?.todai?.name && profile?.exam_settings?.todai?.date && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center space-x-2">
                    <span>{profile.exam_settings.todai.name}まで</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-800">
                    {calculateDaysLeft(profile.exam_settings.todai.date)}日
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {profile.exam_settings.todai.date}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SidebarCountdownSection;
