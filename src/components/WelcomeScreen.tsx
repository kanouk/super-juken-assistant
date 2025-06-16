
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, Calculator, FlaskConical, Atom, Languages, 
  MapPin, Monitor, Plus, GraduationCap, Sparkles, 
  Target, TrendingUp, Clock, User
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";

interface WelcomeScreenProps {
  onSubjectSelect: (subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  dailyQuestions: number;
  understoodCount: number;
}

const WelcomeScreen = ({ 
  onSubjectSelect, 
  onToggleSidebar, 
  isMobile, 
  dailyQuestions, 
  understoodCount 
}: WelcomeScreenProps) => {
  const { profile, isLoading: isLoadingProfile } = useProfile();
  const { settings } = useSettings();

  // Get visible and sorted subjects from settings
  const visibleSubjects = settings.subjectConfigs
    .filter(config => config.visible)
    .sort((a, b) => a.order - b.order);

  // Legacy subject data for icons and colors
  const legacySubjects = [
    { id: 'math', name: '数学', icon: Calculator, color: 'from-blue-400 to-blue-600' },
    { id: 'chemistry', name: '化学', icon: FlaskConical, color: 'from-purple-400 to-purple-600' },
    { id: 'biology', name: '生物', icon: Atom, color: 'from-green-400 to-green-600' },
    { id: 'english', name: '英語', icon: Languages, color: 'from-indigo-400 to-indigo-600' },
    { id: 'japanese', name: '国語', icon: BookOpen, color: 'from-red-400 to-red-600' },
    { id: 'geography', name: '地理', icon: MapPin, color: 'from-teal-400 to-teal-600' },
    { id: 'information', name: '情報', icon: Monitor, color: 'from-gray-400 to-gray-600' },
    { id: 'other', name: '全般', icon: Plus, color: 'from-orange-400 to-orange-600' },
    { id: 'physics', name: '物理', icon: Atom, color: 'from-orange-400 to-orange-600' },
    { id: 'japanese_history', name: '日本史', icon: BookOpen, color: 'from-pink-400 to-pink-600' },
    { id: 'world_history', name: '世界史', icon: BookOpen, color: 'from-amber-400 to-amber-600' },
    { id: 'earth_science', name: '地学', icon: Calculator, color: 'from-cyan-400 to-cyan-600' },
  ];

  const displaySubjects = visibleSubjects.map(config => {
    const legacyData = legacySubjects.find(s => s.id === config.id);
    return {
      id: config.id,
      name: config.name && config.name.length > 0 ? config.name : (legacyData?.name || config.id),
      icon: legacyData?.icon || Plus,
      gradient: legacyData?.color || 'from-gray-400 to-gray-600'
    };
  });

  const calculateDaysLeft = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ようこそ！</h1>
            <p className="text-sm text-gray-600">学習したい教科を選択してください</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Sparkles className="h-6 w-6" />
              <span>スーパー受験アシスタントへようこそ！</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 leading-relaxed">
              AIアシスタントとの対話を通じて効率的に学習を進めましょう。
              下の教科から選択してチャットを開始できます。
              {!isLoadingProfile && profile?.display_name && (
                <span className="font-medium"> {profile.display_name}さん、一緒に頑張りましょう！</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{understoodCount}</p>
              <p className="text-sm text-green-600">完全に理解した数</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{dailyQuestions}</p>
              <p className="text-sm text-blue-600">本日の質問数</p>
            </CardContent>
          </Card>

          {profile?.exam_settings?.kyotsu?.name && profile?.exam_settings?.kyotsu?.date && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-800">
                  {calculateDaysLeft(profile.exam_settings.kyotsu.date)}日
                </p>
                <p className="text-sm text-red-600">{profile.exam_settings.kyotsu.name}まで</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-purple-800">
                {!isLoadingProfile && profile?.display_name ? profile.display_name : 'ユーザー'}
              </p>
              <p className="text-sm text-purple-600">学習者</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span>教科を選択</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displaySubjects.map((subject) => {
                const IconComponent = subject.icon;
                return (
                  <Button
                    key={subject.id}
                    variant="outline"
                    className={`h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r ${subject.gradient} text-white border-0 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
                    onClick={() => onSubjectSelect(subject.id)}
                  >
                    <IconComponent className="h-8 w-8" />
                    <span className="font-medium text-sm">{subject.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Goals Display */}
        {profile?.exam_settings && (profile.exam_settings.kyotsu.name || profile.exam_settings.todai.name) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-red-600" />
                <span>あなたの目標</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.exam_settings.kyotsu.name && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-1">第1ゴール</h3>
                    <p className="text-lg font-bold text-red-900">{profile.exam_settings.kyotsu.name}</p>
                    {profile.exam_settings.kyotsu.date && (
                      <p className="text-sm text-red-600 mt-1">
                        {calculateDaysLeft(profile.exam_settings.kyotsu.date)}日後 ({profile.exam_settings.kyotsu.date})
                      </p>
                    )}
                  </div>
                )}
                
                {profile.exam_settings.todai.name && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-1">第2ゴール</h3>
                    <p className="text-lg font-bold text-blue-900">{profile.exam_settings.todai.name}</p>
                    {profile.exam_settings.todai.date && (
                      <p className="text-sm text-blue-600 mt-1">
                        {calculateDaysLeft(profile.exam_settings.todai.date)}日後 ({profile.exam_settings.todai.date})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
