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
  Users,
  Check,
  X,
  Clock
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

  const pricingPlans = [
    {
      name: "無料プラン",
      price: "¥0",
      period: "/月",
      description: "基本的な学習サポート機能",
      features: [
        "基本的なAI学習サポート",
        "学習進捗管理",
        "月10回までの質問",
        "基本的な目標設定"
      ],
      limitations: [
        "高度なAI機能は利用不可",
        "カスタマイズ機能制限"
      ],
      buttonText: "無料で始める",
      popular: false,
      comingSoon: false
    },
    {
      name: "スタンダード",
      price: "¥980",
      period: "/買い切り",
      description: "自分のAPIキーで高性能AIを利用",
      features: [
        "全ての無料機能",
        "APIキー設定機能",
        "高性能AIモデル利用",
        "無制限の質問",
        "詳細な学習分析",
        "カスタム学習プラン"
      ],
      limitations: [],
      buttonText: "今すぐ購入",
      popular: true,
      comingSoon: false
    },
    {
      name: "プレミアム",
      price: "¥2,980",
      period: "/月",
      description: "最高品質のAIサービスを利用",
      features: [
        "全てのスタンダード機能",
        "最新のAIモデル使い放題",
        "優先サポート",
        "高速レスポンス",
        "専用学習アシスタント",
        "詳細な成績分析レポート"
      ],
      limitations: [],
      buttonText: "カミングスーン",
      popular: false,
      comingSoon: true
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
                始める
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
              今すぐ体験する
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
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

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              あなたに最適なプランを選択
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              学習スタイルや目標に合わせて、最適なプランをお選びください
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      人気No.1
                    </Badge>
                  </div>
                )}
                {plan.comingSoon && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1">
                      <Clock className="h-3 w-3 mr-1" />
                      カミングスーン
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h4>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-blue-600">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-1">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {plan.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-center">
                        <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full text-lg py-3 ${
                      plan.comingSoon 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : plan.popular 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                          : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                    onClick={() => !plan.comingSoon && navigate('/login')}
                    disabled={plan.comingSoon}
                  >
                    {plan.buttonText}
                  </Button>
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
            AIアシスタントによる学習サポートの効果を実感してください。
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-3 font-semibold"
          >
            始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Service Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">スーパー受験アシスタント</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                最新のAI技術を活用した受験サポートサービス。
                一人ひとりの学習スタイルに合わせた最適な学習体験を提供し、
                あなたの志望校合格をサポートします。
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => navigate('/login')}
                >
                  始める
                </Button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">AI学習サポート</button></li>
                <li><button className="hover:text-white transition-colors">目標管理</button></li>
                <li><button className="hover:text-white transition-colors">進捗分析</button></li>
                <li><button className="hover:text-white transition-colors">全教科対応</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">よくある質問</button></li>
                <li><button className="hover:text-white transition-colors">お問い合わせ</button></li>
                <li><button className="hover:text-white transition-colors">利用規約</button></li>
                <li><button className="hover:text-white transition-colors">プライバシーポリシー</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
                <p>&copy; 2024 スーパー受験アシスタント. All rights reserved.</p>
                <p className="text-sm mt-1">AIアシスタントと一緒に効率的に学習しよう</p>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-gray-500 text-sm">フォローする</span>
                <div className="flex space-x-4">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
