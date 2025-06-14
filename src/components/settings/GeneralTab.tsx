
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface GeneralTabProps {
  commonInstruction: string;
  updateSetting: (path: string, value: any) => void;
}

export const GeneralTab = ({ commonInstruction, updateSetting }: GeneralTabProps) => {
  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 p-4 lg:p-6">
        <CardTitle className="flex items-center text-lg lg:text-xl">
          <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-orange-600" />
          全体インストラクション
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <div>
          <Label htmlFor="common-instruction" className="text-sm font-medium text-gray-700">
            共通インストラクション
          </Label>
          <Textarea
            id="common-instruction"
            value={commonInstruction}
            onChange={(e) => updateSetting('commonInstruction', e.target.value)}
            rows={4}
            placeholder="AIに対する共通の指示を入力してください..."
            className="mt-2 border-2 border-gray-200 focus:border-orange-500 text-sm lg:text-base"
          />
          <p className="text-xs lg:text-sm text-gray-600 mt-2">
            すべての教科で共通して使用される基本的な指示です。教科別のカスタムインストラクションは「教科設定」タブで設定できます。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
