
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GeneralSettingsTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

export const GeneralSettingsTab = ({ settings, updateSetting }: GeneralSettingsTabProps) => {
  const handleSubjectInstructionChange = (subjectId: string, value: string) => {
    updateSetting('default_subject_instructions', {
      ...settings.default_subject_instructions,
      [subjectId]: value
    });
  };

  const subjects = [
    { id: 'math', name: '数学' },
    { id: 'chemistry', name: '化学' },
    { id: 'biology', name: '生物' },
    { id: 'physics', name: '物理' },
    { id: 'earth_science', name: '地学' },
    { id: 'english', name: '英語' },
    { id: 'japanese', name: '国語' },
    { id: 'world_history', name: '世界史' },
    { id: 'japanese_history', name: '日本史' },
    { id: 'geography', name: '地理' },
    { id: 'information', name: '情報' },
    { id: 'other', name: 'その他' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本設定</CardTitle>
          <CardDescription>サービス全体の基本的な設定を管理します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="default_pin">デフォルトPIN番号</Label>
            <Input
              id="default_pin"
              value={settings.default_pin || ''}
              onChange={(e) => updateSetting('default_pin', e.target.value)}
              placeholder="999999"
            />
          </div>
          
          <div>
            <Label htmlFor="default_common_instruction">デフォルト全般インストラクション</Label>
            <Textarea
              id="default_common_instruction"
              value={settings.default_common_instruction || ''}
              onChange={(e) => updateSetting('default_common_instruction', e.target.value)}
              placeholder="あなたは大学受験生の学習をサポートするAIアシスタントです..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>教科別デフォルトインストラクション</CardTitle>
          <CardDescription>各教科のデフォルト指示を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id}>
              <Label htmlFor={`subject_${subject.id}`}>{subject.name}</Label>
              <Textarea
                id={`subject_${subject.id}`}
                value={settings.default_subject_instructions?.[subject.id] || ''}
                onChange={(e) => handleSubjectInstructionChange(subject.id, e.target.value)}
                placeholder={`${subject.name}の指示を入力してください...`}
                className="min-h-[80px]"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
