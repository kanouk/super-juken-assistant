
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteAccountCardProps {
  onAccountDeleted: () => void;
}

const DeleteAccountCard: React.FC<DeleteAccountCardProps> = ({ onAccountDeleted }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    if (confirmText !== '退会する') {
      toast({
        title: "確認テキストが正しくありません",
        description: "「退会する」と正確に入力してください。",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      toast({
        title: "退会完了",
        description: "アカウントが正常に削除されました。ご利用ありがとうございました。",
      });

      // ログアウト処理とリダイレクト
      await supabase.auth.signOut();
      onAccountDeleted();
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "退会エラー",
        description: `退会処理に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>アカウント削除</span>
        </CardTitle>
        <CardDescription>
          アカウントを完全に削除します。この操作は取り消すことができません。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="text-sm font-medium text-red-800 mb-2">削除される情報</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• プロフィール情報</li>
            <li>• すべての会話履歴とメッセージ</li>
            <li>• 設定情報</li>
            <li>• 管理者権限（該当する場合）</li>
            <li>• その他のすべての関連データ</li>
          </ul>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              アカウントを削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                アカウントの削除確認
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  本当にアカウントを削除しますか？この操作は<strong>取り消すことができません</strong>。
                </p>
                <p>
                  すべてのデータが永久に削除されます。
                </p>
                <div className="mt-4">
                  <Label htmlFor="confirm">
                    確認のため「<strong>退会する</strong>」と入力してください
                  </Label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="退会する"
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== '退会する'}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? '削除中...' : '完全に削除'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default DeleteAccountCard;
