
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain } from "lucide-react";
import { MBTI_TYPES } from '@/types/profile';

interface MbtiCardProps {
  mbti: string | null;
  onMbtiChange: (value: string | null) => void;
}

const MbtiCard: React.FC<MbtiCardProps> = ({ mbti, onMbtiChange }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg p-4 lg:p-6">
        <CardTitle className="flex items-center space-x-2 text-lg lg:text-xl">
          <Brain className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
          <span>MBTI設定</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            MBTIタイプ
          </Label>
          <Select value={mbti || "不明"} onValueChange={onMbtiChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="MBTIタイプを選択" />
            </SelectTrigger>
            <SelectContent>
              {MBTI_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs lg:text-sm text-gray-500">
          MBTIタイプに基づいてパーソナライズされた学習アドバイスを提供します。
        </p>
      </CardContent>
    </Card>
  );
};

export default MbtiCard;
