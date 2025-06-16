import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Target, 
  TrendingUp, 
  Zap, 
  Star, 
  CheckCircle,
  ArrowRight,
  BookOpen,
  Brain,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI学習サポート",
      description: "最新のAI技術があなたの学習をサポート。理解度に合わせて最適化された学習体験を提供します。"
    },
    {
      icon: Target,
      title: "目標設定＆管理",
      description: "共通テストから難関大学まで、あなたの目標に向けた戦略的学習プランを作成します。"
    },
    {
      icon: TrendingUp,
      title: "学習進捗の可視化",
      description: "日々の学習成果を数値化し、モチベーション維持と効率的な学習をサポートします。"
    },
    {
      icon: BookOpen,
      title: "全教科対応",
      description: "数学、英語、国語、理科、社会まで、受験に必要な全教科を幅広くカバーしています。"
    }
  ];

  const stats = [
    { number: "10,000+", label: "解決した問題数" },
    { number: "95%", label: "ユーザー満足度" },
    { number: "24/7", label: "いつでもアクセス" },
    { number: "全教科", label: "対応科目" }
  ];

  const testimonials = [
    {
      name: "田中 優希",
      grade: "高校3年生",
      comment: "AIが私の弱点を的確に見つけて、効率的に学習できるようになりました。偏差値が15も上がりました！",
      rating: 5
    },
    {
      name: "佐藤 健太",
      grade: "高校2年生", 
      comment: "24時間いつでも質問できるのが最高です。夜中の勉強でも即座に回答してくれて、理解が深まります。",
      rating: 5
    },
    {
      name: "山田 美咲",
      grade: "高校3年生",
      comment: "目標管理機能で受験までの道筋が明確になりました。計画的に学習を進められています。",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">スーパー受験アシスタント</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900"
              >
                ログイン
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                無料で始める
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Zap className="h-4 w-4 mr-1" />
            最新AI技術搭載
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AIが支える、
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              あなたの
            </span>
            <br />
            受験成功への道
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            一人ひとりの学習スタイルと理解度に合わせた、AIアシスタントがあなたの受験をサポート。
            効率的で確実な学習で、あなたの夢を現実にします。
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-3"
            >
              今すぐ無料で体験する
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-500">無料トライアル • クレジットカード不要</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              なぜスーパー受験アシスタントが選ばれるのか
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              従来の予備校や家庭教師にはない、AI技術による革新的な学習サポートをお届けします
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              利用者の声
            </h3>
            <p className="text-xl text-gray-600">
              実際にスーパー受験アシスタントで成果を上げた生徒たちの体験談
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.grade}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-white mb-6">
            あなたの合格への第一歩を、今すぐ踏み出そう
          </h3>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            無料トライアルで、AIアシスタントによる学習サポートの効果を実感してください。
            クレジットカードは不要です。
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-3 font-semibold"
          >
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">スーパー受験アシスタント</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 スーパー受験アシスタント. All rights reserved.</p>
              <p className="text-sm mt-1">AIアシスタントと一緒に効率的に学習しよう</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
