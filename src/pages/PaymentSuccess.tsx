
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import WebhookDebugPanel from '@/components/billing/WebhookDebugPanel';
import ConfettiComponent from '@/components/Confetti';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { profile, refetchProfile } = useProfile();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // プロフィールを自動更新
    refetchProfile();
    
    // 少し遅延してconfettiを表示
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [refetchProfile]);

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'one_time':
        return '買い切りプラン';
      case 'premium_monthly':
        return 'プレミアムプラン（月額）';
      default:
        return 'フリープラン';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <ConfettiComponent trigger={showConfetti} />
      
      <div className="w-full max-w-2xl space-y-6">
        {/* メイン成功カード */}
        <Card className="bg-white shadow-lg border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              🎉 お支払いが完了しました！
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ありがとうございます。決済が正常に処理されました。
              </p>
              
              {sessionId && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">セッションID</p>
                  <p className="font-mono text-xs text-gray-700">{sessionId}</p>
                </div>
              )}
            </div>

            {profile && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-2">現在のプラン</h3>
                <p className="text-lg font-bold text-blue-600">
                  {getPlanDisplayName(profile.plan)}
                </p>
                {profile.points !== null && (
                  <p className="text-sm text-gray-600 mt-1">
                    利用可能ポイント: {profile.points} ポイント
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate('/app')} 
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                アプリに戻る
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/billing')}
                className="flex-1"
              >
                課金設定を見る
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* デバッグパネル */}
        <WebhookDebugPanel />

        {/* 戻るリンク */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
