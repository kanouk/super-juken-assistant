
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MBTI_TYPES } from "@/hooks/useAdminSettings";
import { MbtiInstructionInput } from "./MbtiInstructionInput";
import type { MbtiInstructionsTabProps } from "./MbtiInstructionsTab.types";

export const MbtiInstructionsTab = ({ mbtiInstructions, updateSetting }: MbtiInstructionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>性格タイプ別カスタムインストラクション</CardTitle>
        <CardDescription>各MBTIタイプごとに、AIアシスタントの振る舞いをカスタマイズできます。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {MBTI_TYPES.map((type) => (
          <MbtiInstructionInput
            key={type}
            type={type}
            value={mbtiInstructions?.[type] || ""}
            onChange={(newValue) =>
              updateSetting("mbti_instructions", {
                ...mbtiInstructions,
                [type]: newValue,
              })
            }
          />
        ))}
      </CardContent>
    </Card>
  );
};
