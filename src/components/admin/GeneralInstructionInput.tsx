
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GeneralInstructionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const GeneralInstructionInput = ({ value, onChange }: GeneralInstructionInputProps) => (
  <div>
    <Label htmlFor="default_common_instruction">全般インストラクション（管理者設定）</Label>
    <Textarea
      id="default_common_instruction"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="min-h-[100px]"
      placeholder="AIに対する共通の指示を入力してください..."
    />
    <p className="text-xs text-gray-600 mt-2">
      すべての教科で共通して使われる基本的な指示文です。
      <br />
      <strong>ユーザーがカスタム設定していない場合は、この内容が使用されます。</strong>
    </p>
  </div>
);
