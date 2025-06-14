import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera, Loader2 } from "lucide-react";
import { UserProfile } from '@/types/profile';
import { useToast } from "@/hooks/use-toast";

interface BasicInfoCardProps {
  profile: UserProfile;
  onProfileChange: (field: keyof UserProfile, value: any) => void;
  onAvatarUpload: (file: File) => Promise<string | null>; // Added for handling upload
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ profile, onProfileChange, onAvatarUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const newAvatarUrl = await onAvatarUpload(file);
        if (newAvatarUrl) {
          onProfileChange('avatar_url', newAvatarUrl); // Update parent state if needed, or rely on useProfile hook
          toast({
            title: "成功",
            description: "アバターが更新されました。",
          });
        } else {
          throw new Error("アバターのアップロードに失敗しました。");
        }
      } catch (error: any) {
        console.error("Avatar upload failed:", error);
        toast({
          title: "エラー",
          description: error.message || "アバターのアップロード中にエラーが発生しました。",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        // Clear the file input value so the same file can be selected again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
              disabled={isUploading}
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md hover:shadow-lg"
              onClick={handleCameraClick}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
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
