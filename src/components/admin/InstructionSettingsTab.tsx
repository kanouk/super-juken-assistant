
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GeneralInstructionInput } from "./GeneralInstructionInput";
import { SubjectInstructionsInput } from "./SubjectInstructionsInput";
import { MbtiInstructionsTab } from "./MbtiInstructionsTab";

interface InstructionSettingsTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

export const InstructionSettingsTab = ({ settings, updateSetting }: InstructionSettingsTabProps) => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>全般インストラクション</CardTitle>
        </CardHeader>
        <CardContent>
          <GeneralInstructionInput
            value={settings.default_common_instruction || ""}
            onChange={(v) => updateSetting("default_common_instruction", v)}
          />
        </CardContent>
      </Card>
      <SubjectInstructionsInput
        subjectInstructions={settings.default_subject_instructions || {}}
        updateSetting={updateSetting}
      />
      <MbtiInstructionsTab
        mbtiInstructions={settings.mbti_instructions || {}}
        updateSetting={updateSetting}
      />
    </div>
  );
};
