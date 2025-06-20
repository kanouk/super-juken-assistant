
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

const WebhookDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { profile, refetchProfile } = useProfile();
  const { toast } = useToast();

  const handleManualSync = async () => {
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "エラー",
          description: "ユーザー認証が必要です",
          variant: "destructive"
        });
        return;
      }

      // プロフィール状態を再取得
      await refetchProfile();
      
      toast({
        title: "同期完了",
        description: "プロフィール状態を更新しました",
      });
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "同期エラー",
        description: "プロフィール同期に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getPlanStatus = () => {
    if (!profile?.plan || profile.plan === 'free') {
      return { label: 'フリープラン', color: 'bg-gray-100 text-gray-800' };
    }
    if (profile.plan === 'one_time') {
      return { label: '買い切りプラン', color: 'bg-blue-100 text-blue-800' };
    }
    if (profile.plan === 'premium_monthly') {
      return { label: 'プレミアムプラン', color: 'bg-purple-100 text-purple-800' };
    }
    return { label: '不明', color: 'bg-red-100 text-red-800' };
  };

  const planStatus = getPlanStatus();

  return (
    <Card className="mt-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>🔧 デバッグ情報</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">プラン状態:</span>
                <Badge className={`ml-2 ${planStatus.color}`}>
                  {planStatus.label}
                </Badge>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">ポイント:</span>
                <span className="ml-2 font-mono">{profile?.points ?? 'null'}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Stripe顧客ID:</span>
                <span className="ml-2 font-mono text-xs">
                  {profile?.stripe_customer_id ? 
                    `${profile.stripe_customer_id.substring(0, 10)}...` : 
                    'null'
                  }
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">ユーザーID:</span>
                <span className="ml-2 font-mono text-xs">
                  {profile?.id ? `${profile.id.substring(0, 8)}...` : 'null'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">手動同期</p>
                  <p className="text-xs text-gray-500">Webhookが失敗した場合の手動同期</p>
                </div>
                <Button 
                  onClick={handleManualSync}
                  disabled={isChecking}
                  size="sm"
                  variant="outline"
                >
                  {isChecking ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  同期
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">Webhook URL:</p>
              <code className="break-all">
                https://huyumzlevlcxsnvbtcsd.supabase.co/functions/v1/stripe-webhook
              </code>
              <p className="mt-2 font-medium">必要なイベント:</p>
              <ul className="list-disc list-inside">
                <li>checkout.session.completed</li>
                <li>invoice.payment_succeeded</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default WebhookDebugPanel;
