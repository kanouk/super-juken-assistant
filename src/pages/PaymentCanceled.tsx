
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';

const PaymentCanceled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* メインキャンセルカード */}
        <Card className="bg-white shadow-lg border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-700">
              お支払いがキャンセルされました
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                決済処理が中断されました。いつでも再度お試しいただけます。
              </p>
              
              {sessionId && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">セッションID</p>
                  <p className="font-mono text-xs text-gray-700">{sessionId}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">💡 ヒント</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• カード情報を再度確認してください</li>
                <li>• 別の支払い方法をお試しください</li>
                <li>• 問題が続く場合はサポートまでお問い合わせください</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate('/billing')} 
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                再度お支払いする
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/app')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                アプリに戻る
              </Button>
            </div>
          </CardContent>
        </Card>

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

export default PaymentCanceled;
