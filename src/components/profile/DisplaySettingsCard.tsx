
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { UserProfile } from '@/types/profile';

interface DisplaySettingsCardProps {
  showCountdown: UserProfile['show_countdown'];
  onShowCountdownChange: (checked: boolean) => void;
}

const DisplaySettingsCard: React.FC<DisplaySettingsCardProps> = ({ showCountdown, onShowCountdownChange }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Settings2 className="h-5 w-5 text-green-600" />
          <span>表示設定</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              カウントダウン表示
            </Label>
            <p className="text-sm text-gray-500">
              サイドバーに入試までのカウントダウンを表示します
            </p>
          </div>
          <Switch
            checked={showCountdown}
            onCheckedChange={onShowCountdownChange}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DisplaySettingsCard;
