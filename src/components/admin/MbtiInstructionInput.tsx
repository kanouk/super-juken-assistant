
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MbtiInstructionInputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
}

export const MbtiInstructionInput = ({ type, value, onChange }: MbtiInstructionInputProps) => (
  <div>
    <Label htmlFor={`mbti_instruction_${type}`}>{type}</Label>
    <Textarea
      id={`mbti_instruction_${type}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="min-h-[60px]"
      placeholder={`${type}タイプのカスタム指示文…`}
    />
  </div>
);
