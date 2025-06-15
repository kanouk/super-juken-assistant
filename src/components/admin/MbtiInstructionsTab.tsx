
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MBTI_TYPES } from "@/hooks/useAdminSettings";

interface MbtiInstructionsTabProps {
  mbtiInstructions: Record<string, string>;
  updateSetting: (key: string, value: any) => void;
}

export const MbtiInstructionsTab = ({ mbtiInstructions, updateSetting }: MbtiInstructionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>性格タイプ別カスタムインストラクション</CardTitle>
        <CardDescription>
          各MBTIタイプごとに、AIアシスタントの振る舞いをカスタマイズできます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {MBTI_TYPES.map((type) => (
          <div key={type}>
            <Label htmlFor={`mbti_instruction_${type}`}>{type}</Label>
            <Textarea
              id={`mbti_instruction_${type}`}
              value={mbtiInstructions?.[type] || ''}
              onChange={e =>
                updateSetting('mbti_instructions', {
                  ...mbtiInstructions,
                  [type]: e.target.value
                })
              }
              className="min-h-[60px]"
              placeholder={`${type}タイプのカスタム指示文…`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
