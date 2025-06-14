
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key } from "lucide-react";

interface SecurityTabProps {
  passcode: string;
  updateSetting: (path: string, value: any) => void;
}

export const SecurityTab = ({ passcode, updateSetting }: SecurityTabProps) => {
  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-4 lg:p-6">
        <CardTitle className="flex items-center text-lg lg:text-xl">
          <Shield className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-blue-600" />
          セキュリティ設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-6">
        <div>
          <Label htmlFor="new-passcode" className="text-sm font-medium text-gray-700">
            新しいパスコード（6桁）
          </Label>
          <Input
            id="new-passcode"
            type="password"
            value={passcode}
            onChange={(e) => updateSetting('passcode', e.target.value)}
            placeholder="••••••"
            maxLength={6}
            className="max-w-xs font-mono text-center text-base lg:text-lg h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 mt-2"
          />
          <p className="text-xs lg:text-sm text-gray-600 mt-2 flex items-center">
            <Key className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            設定画面にアクセスする際に使用されます
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
