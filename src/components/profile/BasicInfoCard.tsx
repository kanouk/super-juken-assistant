
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera } from "lucide-react";
import { UserProfile } from '@/types/profile';

interface BasicInfoCardProps {
  profile: UserProfile;
  onProfileChange: (field: keyof UserProfile, value: any) => void;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ profile, onProfileChange }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <span>基本情報</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-blue-100">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md hover:shadow-lg"
              // onClick={() => alert("Avatar upload coming soon!")} // Placeholder
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="display_name" className="text-sm font-medium text-gray-700">
                表示名
              </Label>
              <Input
                id="display_name"
                value={profile.display_name || ''}
                onChange={(e) => onProfileChange('display_name', e.target.value)}
                placeholder="表示名を入力してください"
                className="mt-1 bg-white/80"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => onProfileChange('email', e.target.value)}
                placeholder="メールアドレス"
                className="mt-1 bg-white/80"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoCard;
