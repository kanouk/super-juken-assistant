
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { UserProfile } from '@/types/profile';

interface DisplaySettingsCardProps {
  showCountdown: UserProfile['show_countdown'];
  showStats: UserProfile['show_stats'];
  onShowCountdownChange: (checked: boolean) => void;
  onShowStatsChange: (checked: boolean) => void;
}

const DisplaySettingsCard: React.FC<DisplaySettingsCardProps> = ({ 
  showCountdown, 
  showStats,
  onShowCountdownChange,
  onShowStatsChange 
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg p-4 lg:p-6">
        <CardTitle className="flex items-center space-x-2 text-lg lg:text-xl">
          <Settings2 className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
          <span>表示設定</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <Label className="text-sm font-medium text-gray-700">
              カウントダウン表示
            </Label>
            <p className="text-xs lg:text-sm text-gray-500">
              サイドバーに入試までのカウントダウンを表示します
            </p>
          </div>
          <Switch
            checked={showCountdown}
            onCheckedChange={onShowCountdownChange}
            className="data-[state=checked]:bg-green-600 flex-shrink-0"
          />
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <Label className="text-sm font-medium text-gray-700">
              学習統計表示
            </Label>
            <p className="text-xs lg:text-sm text-gray-500">
              サイドバーに今日の学習統計を表示します
            </p>
          </div>
          <Switch
            checked={showStats}
            onCheckedChange={onShowStatsChange}
            className="data-[state=checked]:bg-green-600 flex-shrink-0"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DisplaySettingsCard;
