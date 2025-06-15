
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SUBJECTS = [
  { id: "math", name: "数学" },
  { id: "chemistry", name: "化学" },
  { id: "biology", name: "生物" },
  { id: "physics", name: "物理" },
  { id: "earth_science", name: "地学" },
  { id: "english", name: "英語" },
  { id: "japanese", name: "国語" },
  { id: "world_history", name: "世界史" },
  { id: "japanese_history", name: "日本史" },
  { id: "geography", name: "地理" },
  { id: "information", name: "情報" },
  { id: "other", name: "その他" },
];

interface SubjectInstructionsInputProps {
  subjectInstructions: Record<string, string>;
  updateSetting: (key: string, value: any) => void;
}

export const SubjectInstructionsInput = ({ subjectInstructions, updateSetting }: SubjectInstructionsInputProps) => {
  const handleChange = (subjectId: string, value: string) => {
    updateSetting("default_subject_instructions", {
      ...subjectInstructions,
      [subjectId]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>教科別インストラクション（管理者設定）</CardTitle>
        <CardDescription>
          各教科ごとにAIアシスタントの指示文をカスタマイズできます。
          <br />
          <strong>ユーザーがカスタム設定していない場合は、ここで設定した内容が使用されます。</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {SUBJECTS.map((subject) => (
          <div key={subject.id}>
            <Label htmlFor={`subject_${subject.id}`}>{subject.name}</Label>
            <Textarea
              id={`subject_${subject.id}`}
              value={subjectInstructions?.[subject.id] || ""}
              onChange={e => handleChange(subject.id, e.target.value)}
              className="min-h-[80px]"
              placeholder={`${subject.name}のカスタム指示文...`}
            />
            <p className="text-xs text-gray-600 mt-1">
              ユーザーがカスタム設定していない場合に使用される{subject.name}用の指示文
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
