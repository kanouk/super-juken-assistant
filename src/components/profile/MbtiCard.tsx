
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain } from "lucide-react";
import { UserProfile, MBTI_TYPES } from '@/types/profile';

interface MbtiCardProps {
  mbti: UserProfile['mbti'];
  onMbtiChange: (value: string | null) => void;
}

const MbtiCard: React.FC<MbtiCardProps> = ({ mbti, onMbtiChange }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>MBTIタイプ</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-2">
        <Label htmlFor="mbti_type" className="text-sm font-medium text-gray-700">
          あなたのMBTIタイプを選択してください
        </Label>
        <Select
          value={mbti || "不明"}
          onValueChange={(value) => onMbtiChange(value === "不明" ? null : value)}
        >
          <SelectTrigger id="mbti_type" className="w-full bg-white/80">
            <SelectValue placeholder="MBTIタイプを選択" />
          </SelectTrigger>
          <SelectContent>
            {MBTI_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          今後のAIアシスタントとの対話で、よりパーソナライズされた応答を提供するために使用されます。
        </p>
      </CardContent>
    </Card>
  );
};

export default MbtiCard;
