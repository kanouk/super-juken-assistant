
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Calculator, Globe, FlaskConical, Atom, Languages, History, Settings, GraduationCap, LogOut, MapPin, Monitor, Plus } from "lucide-react";

interface SidebarProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  dailyQuestions: number;
  totalCost: number;
}

const subjects = [
  { id: 'math', name: '数学', icon: Calculator, color: 'bg-blue-100 text-blue-700' },
  { id: 'chemistry', name: '化学', icon: FlaskConical, color: 'bg-purple-100 text-purple-700' },
  { id: 'biology', name: '生物', icon: Atom, color: 'bg-green-100 text-green-700' },
  { id: 'english', name: '英語', icon: Languages, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'japanese', name: '国語', icon: BookOpen, color: 'bg-red-100 text-red-700' },
  { id: 'geography', name: '地理', icon: MapPin, color: 'bg-teal-100 text-teal-700' },
  { id: 'information', name: '情報', icon: Monitor, color: 'bg-gray-100 text-gray-700' },
  { id: 'other', name: 'その他', icon: Plus, color: 'bg-orange-100 text-orange-700' },
];

const Sidebar = ({ selectedSubject, onSubjectChange, onSettingsClick, onLogout, dailyQuestions, totalCost }: SidebarProps) => {
  const [examDates] = useState({
    kyotsu: new Date('2026-01-17'),
    todai: new Date('2026-02-25')
  });

  const calculateDaysLeft = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <BookOpen className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">スーパー受験アシスタント</h1>
        <p className="text-sm text-gray-600 mt-1">AIとの対話で効率的に学習</p>
      </div>

      {/* Countdown */}
      <div className="p-4 space-y-3">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">共通テストまで</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-800">
              {calculateDaysLeft(examDates.kyotsu)}日
            </div>
            <div className="text-xs text-red-600 mt-1">2026年1月17日</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">東大二次試験まで</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-800">
              {calculateDaysLeft(examDates.todai)}日
            </div>
            <div className="text-xs text-blue-600 mt-1">2026年2月25日</div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Subjects */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">教科選択</h3>
        <div className="space-y-2">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Button
                key={subject.id}
                variant={selectedSubject === subject.id ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  selectedSubject === subject.id 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => onSubjectChange(subject.id)}
              >
                <div className={`p-2 rounded-md mr-3 ${
                  selectedSubject === subject.id ? "bg-white/20" : subject.color
                }`}>
                  <Icon className={`h-4 w-4 ${
                    selectedSubject === subject.id ? "text-white" : ""
                  }`} />
                </div>
                <span className="font-medium">{subject.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">本日の質問数</span>
          <Badge variant="secondary">{dailyQuestions}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">累計コスト</span>
          <Badge variant="outline">¥{totalCost.toFixed(2)}</Badge>
        </div>
      </div>

      <Separator />

      {/* Settings and Logout */}
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4 mr-2" />
          設定
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          ログアウト
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
