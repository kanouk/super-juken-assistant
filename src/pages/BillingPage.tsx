
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

const BillingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile, refetchProfile } = useProfile();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast({
        title: "決済が完了しました！",
        description: "プランが正常にアップグレードされました。",
      });
      refetchProfile();
    } else if (urlParams.get('canceled') === 'true') {
      toast({
        title: "決済がキャンセルされました",
        description: "決済はキャンセルされました。いつでも再度お試しいただけます。",
        variant: "destructive",
      });
    }
  }, [toast, refetchProfile]);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'フリープラン',
      price: '¥0',
      period: '永久無料',
      description: '基本機能をお試しいただけます',
      features: [
        { name: '基本的なAI学習サポート', included: true },
        { name: '10ポイント/月', included: true },
        { name: '基本的な科目対応', included: true },
        { name: 'プレミアム機能', included: false },
        { name: '無制限ポイント', included: false },
      ],
    },
    {
      id: 'one_time',
      name: '買い切りプラン',
      price: '¥998',
      period: '一回限り',
      description: '追加機能を永続的に利用可能',
      features: [
        { name: '基本的なAI学習サポート', included: true },
        { name: '100ポイント（一回限り）', included: true },
        { name: '全科目対応', included: true },
        { name: 'プレミアム機能の一部', included: true },
        { name: '無制限ポイント', included: false },
      ],
    },
    {
      id: 'premium_monthly',
      name: 'プレミアムプラン',
      price: '¥1,998',
      period: '月額',
      description: '全機能を無制限でご利用いただけます',
      popular: true,
      features: [
        { name: '全てのAI学習サポート', included: true },
        { name: '200ポイント/月', included: true },
        { name: '全科目対応', included: true },
        { name: '全てのプレミアム機能', included: true },
        { name: '優先サポート', included: true },
      ],
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;

    setIsLoading(true);
    setLoadingPlan(planId);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "認証エラー",
          description: "ログインが必要です。",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: "エラーが発生しました",
          description: "決済ページの作成に失敗しました。",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Stripe Checkoutページにリダイレクト
        window.location.href = data.url;
      } else {
        toast({
          title: "エラーが発生しました",
          description: "決済URLの取得に失敗しました。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "エラーが発生しました",
        description: "決済の処理中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  const getCurrentPlanDisplayName = (plan: string | null) => {
    const planMap: { [key: string]: string } = {
      'free': 'フリープラン',
      'one_time': '買い切りプラン',
      'premium_monthly': 'プレミアムプラン',
    };
    return planMap[plan || 'free'] || 'フリープラン';
  };

  const isCurrentPlan = (planId: string) => {
    return profile?.plan === planId || (planId === 'free' && !profile?.plan);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            プランを選択してください
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            あなたの学習スタイルに合ったプランをお選びください。いつでもアップグレード可能です。
          </p>
          {profile && (
            <div className="mt-6 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              現在のプラン: {getCurrentPlanDisplayName(profile.plan)}
              {profile.points !== undefined && (
                <span className="ml-2">({profile.points} ポイント)</span>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-lg'} ${
                isCurrentPlan(plan.id) ? 'bg-green-50 border-green-300' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    人気プラン
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2 text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                        feature.included ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {feature.included ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-500'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading || isCurrentPlan(plan.id) || plan.id === 'free'}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  } ${isCurrentPlan(plan.id) ? 'bg-green-600 hover:bg-green-600' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loadingPlan === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      処理中...
                    </div>
                  ) : isCurrentPlan(plan.id) ? (
                    '現在のプラン'
                  ) : plan.id === 'free' ? (
                    '現在利用中'
                  ) : (
                    `${plan.name}にアップグレード`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            よくある質問
          </h2>
          <div className="max-w-3xl mx-auto text-left">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900">プランの変更はいつでもできますか？</h3>
                <p className="text-gray-600 mt-2">
                  はい、いつでもプランのアップグレードが可能です。プレミアムプランの場合、次回請求日から新しい料金が適用されます。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ポイントはどのように使用されますか？</h3>
                <p className="text-gray-600 mt-2">
                  ポイントはAIとの対話やプレミアム機能の利用時に消費されます。プレミアムプランでは毎月ポイントが自動的にリセットされます。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">決済は安全ですか？</h3>
                <p className="text-gray-600 mt-2">
                  すべての決済はStripeによって処理され、業界標準のセキュリティで保護されています。クレジットカード情報は当社のサーバーには保存されません。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
