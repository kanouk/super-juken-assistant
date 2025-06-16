
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { UserProfile, ExamSettings } from '@/types/profile';

interface ExamSettingsCardProps {
  examSettings: UserProfile['exam_settings'];
  onExamSettingChange: (exam: 'kyotsu' | 'todai', field: 'name' | 'date', value: string) => void;
}

const ExamSettingsCard: React.FC<ExamSettingsCardProps> = ({ examSettings, onExamSettingChange }) => {
  // 第二試験が設定されているかチェック
  const hasSecondExam = examSettings.todai.name.trim() !== '' || examSettings.todai.date !== '';

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-red-600" />
          <span>受験予定設定</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* 第一志望 */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
            第一志望
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kyotsu_name" className="text-sm font-medium text-gray-700">
                試験名
              </Label>
              <Input
                id="kyotsu_name"
                value={examSettings.kyotsu.name}
                onChange={(e) => onExamSettingChange('kyotsu', 'name', e.target.value)}
                className="mt-1 bg-white/80"
              />
            </div>
            <div>
              <Label htmlFor="kyotsu_date" className="text-sm font-medium text-gray-700">
                試験日
              </Label>
              <Input
                id="kyotsu_date"
                type="date"
                value={examSettings.kyotsu.date}
                onChange={(e) => onExamSettingChange('kyotsu', 'date', e.target.value)}
                className="mt-1 bg-white/80"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* 第二志望 */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
            第二志望
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="todai_name" className="text-sm font-medium text-gray-700">
                試験名
              </Label>
              <Input
                id="todai_name"
                value={examSettings.todai.name}
                onChange={(e) => onExamSettingChange('todai', 'name', e.target.value)}
                className="mt-1 bg-white/80"
                placeholder="第二志望がある場合は入力してください"
              />
            </div>
            <div>
              <Label htmlFor="todai_date" className="text-sm font-medium text-gray-700">
                試験日
              </Label>
              <Input
                id="todai_date"
                type="date"
                value={examSettings.todai.date}
                onChange={(e) => onExamSettingChange('todai', 'date', e.target.value)}
                className="mt-1 bg-white/80"
              />
            </div>
          </div>
          {!hasSecondExam && (
            <p className="text-xs text-gray-500">
              ※ 第二志望を設定しない場合は空欄のままにしてください
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamSettingsCard;
