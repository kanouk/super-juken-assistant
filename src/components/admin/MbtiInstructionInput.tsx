
// MBTIタイプと日本語注釈
const MBTI_TYPE_LABELS: Record<string, string> = {
  ISTJ: "管理者",
  ISFJ: "擁護者",
  INFJ: "提唱者",
  INTJ: "建築家",
  ISTP: "巨匠",
  ISFP: "冒険家",
  INFP: "仲介者",
  INTP: "論理学者",
  ESTP: "起業家",
  ESFP: "エンターテイナー",
  ENFP: "広報運動家",
  ENTP: "討論者",
  ESTJ: "幹部",
  ESFJ: "領事官",
  ENFJ: "主人公",
  ENTJ: "指揮官",
  不明: "（未設定/不明）"
};

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MbtiInstructionInputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
}

export const MbtiInstructionInput = ({ type, value, onChange }: MbtiInstructionInputProps) => (
  <div>
    <Label htmlFor={`mbti_instruction_${type}`}>{type} <span className="text-gray-400 text-xs">（{MBTI_TYPE_LABELS[type] || ""}）</span></Label>
    <Textarea
      id={`mbti_instruction_${type}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="min-h-[60px]"
      placeholder={`${type}タイプ（${MBTI_TYPE_LABELS[type] || ""}）のカスタム指示文…`}
    />
  </div>
);
