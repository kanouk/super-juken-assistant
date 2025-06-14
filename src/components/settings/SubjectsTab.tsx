
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, Languages, FlaskConical, Globe, Zap, Atom, MapPin, Monitor, Plus, GripVertical, Eye, EyeOff } from "lucide-react";

interface SubjectConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  instruction: string;
}

interface SubjectsTabProps {
  subjectConfigs: SubjectConfig[];
  updateSubjectConfig: (id: string, field: string, value: any) => void;
  moveSubject: (dragIndex: number, hoverIndex: number) => void;
}

export const SubjectsTab = ({ subjectConfigs, updateSubjectConfig, moveSubject }: SubjectsTabProps) => {
  const getSubjectIcon = (subjectId: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      math: Calculator,
      chemistry: FlaskConical,
      biology: Atom,
      english: Languages,
      japanese: BookOpen,
      geography: MapPin,
      information: Monitor,
      other: Plus
    };
    return iconMap[subjectId] || Plus;
  };

  const getSubjectColor = (subjectId: string) => {
    const colorMap: { [key: string]: string } = {
      math: 'text-blue-600',
      chemistry: 'text-purple-600',
      biology: 'text-green-600',
      english: 'text-indigo-600',
      japanese: 'text-red-600',
      geography: 'text-teal-600',
      information: 'text-gray-600',
      other: 'text-orange-600'
    };
    return colorMap[subjectId] || 'text-orange-600';
  };

  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-100">
        <CardTitle className="flex items-center text-xl">
          <BookOpen className="h-6 w-6 mr-3 text-teal-600" />
          教科設定
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            教科の表示/非表示、並び順、カスタムインストラクションを設定できます。
          </p>
          
          {subjectConfigs
            .sort((a, b) => a.order - b.order)
            .map((config, index) => {
              const IconComponent = getSubjectIcon(config.id);
              const iconColor = getSubjectColor(config.id);
              
              return (
                <Card key={config.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-move p-1"
                          onMouseDown={() => {
                            if (index > 0) {
                              moveSubject(index, index - 1);
                            }
                          }}
                        >
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                        <IconComponent className={`h-5 w-5 ${iconColor}`} />
                        <span className="font-medium text-gray-900">{config.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {config.visible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <Switch
                            checked={config.visible}
                            onCheckedChange={(checked) => 
                              updateSubjectConfig(config.id, 'visible', checked)
                            }
                          />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          順序: {config.order}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`${config.id}-instruction`} className="text-sm font-medium text-gray-700">
                        カスタムインストラクション
                      </Label>
                      <Textarea
                        id={`${config.id}-instruction`}
                        value={config.instruction}
                        onChange={(e) => updateSubjectConfig(config.id, 'instruction', e.target.value)}
                        rows={3}
                        placeholder={`${config.name}に関する指示を入力してください...`}
                        className="mt-2 border-2 border-gray-200 focus:border-teal-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
