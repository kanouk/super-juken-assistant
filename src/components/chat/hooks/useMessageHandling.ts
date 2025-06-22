
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';

interface UseMessageHandlingProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  profile: any;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  createConversation: (title: string, subject: string) => Promise<any>;
  updateConversation: (id: string, title?: string | null, isUnderstood?: boolean) => Promise<void>;
  setConversationUnderstood: (understood: boolean) => void;
  onConfettiTrigger?: () => void;
  onUrlUpdate?: (conversationId: string) => void;
  onStreakUpdate?: () => void;
}

export const useMessageHandling = (props: UseMessageHandlingProps) => {
  const { 
    subject, 
    subjectName, 
    currentModel, 
    profile,
    selectedConversationId,
    setSelectedConversationId,
    createConversation,
    updateConversation,
    setConversationUnderstood,
    onConfettiTrigger,
    onUrlUpdate,
    onStreakUpdate
  } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const { toast } = useToast();

  // 会話理解時の自動タグ付け機能
  const performAutoTagging = useCallback(async (conversationId: string, messages: Message[]) => {
    try {
      console.log('🏷️ 会話自動タグ付け開始:', conversationId);
      setIsTagging(true);
      
      // ユーザーの質問とAIの回答を取得
      const userMessage = messages.find(msg => msg.role === 'user');
      const assistantMessage = messages.find(msg => msg.role === 'assistant');
      
      if (!userMessage) {
        console.log('❌ タグ付け用のユーザーメッセージが見つかりません');
        toast({
          title: "タグ付けエラー",
          description: "ユーザーメッセージが見つかりません。",
          variant: "destructive",
        });
        return false;
      }

      const conversationContent = {
        question: userMessage.content,
        answer: assistantMessage?.content || '',
        subject: subject
      };

      console.log('📤 自動タグ付けリクエスト送信...');
      const { data, error } = await supabase.functions.invoke('auto-tag-question', {
        body: {
          conversationId,
          conversationContent,
          subject
        }
      });

      console.log('📥 自動タグ付けレスポンス:', data);
      
      if (error) {
        console.error('❌ 自動タグ付けエラー:', error);
        toast({
          title: "自動タグ付けエラー",
          description: `タグ付けに失敗しました: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (data?.success) {
        if (data.tagsCount > 0) {
          console.log(`✅ 自動タグ付け成功: ${data.tagsCount}個のタグを適用`);
          toast({
            title: "自動タグ付け完了",
            description: `${data.tagsCount}個のタグが自動的に付与されました。\n教科: ${data.subject}\n利用可能タグ数: ${data.availableTags}`,
          });
        } else {
          console.log('ℹ️ 自動タグ付け完了（タグ適用なし）');
          toast({
            title: "タグ付け完了",
            description: `教科「${data.subject}」で処理しましたが、適用可能なタグがありませんでした。\n利用可能タグ数: ${data.availableTags}`,
          });
        }
      } else {
        console.log('⚠️ 自動タグ付け完了（警告あり）');
        toast({
          title: "タグ付け警告",
          description: data?.message || "タグ付け処理が完了しましたが、予期しない結果でした。",
          variant: "destructive",
        });
      }
      
      return true;
    } catch (error) {
      console.error('💥 自動タグ付け失敗:', error);
      toast({
        title: "自動タグ付けエラー",
        description: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTagging(false);
    }
  }, [subject, toast]);

  const handleSendMessage = useCallback(async (content: string, images?: any[]) => {
    if (!profile?.id) {
      toast({
        title: "エラー",
        description: "プロフィールが見つかりません。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let conversationId = selectedConversationId;
      
      // 必要に応じて会話を作成
      if (!conversationId) {
        const conversation = await createConversation(content.substring(0, 50), subject);
        conversationId = conversation.id;
        setSelectedConversationId(conversationId);
        
        // 新規会話作成時のURL更新
        if (onUrlUpdate && conversationId) {
          onUrlUpdate(conversationId);
        }
      }

      // ユーザーメッセージ作成
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        subject,
        image_url: images?.[0]?.url,
        conversation_id: conversationId,
      };

      setMessages(prev => [...prev, userMessage]);

      // ユーザーメッセージをデータベースに保存
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: content,
          role: 'user',
          created_at: new Date().toISOString(),
          image_url: images?.[0]?.url
        });

      if (userMessageError) {
        console.error('ユーザーメッセージ保存失敗:', userMessageError);
      }

      // 会話履歴を準備
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        image_url: msg.image_url
      }));

      console.log('🚀 AI呼び出しとストリーク更新...');

      // 統一Edge Function方式でAI呼び出し（ストリークは自動更新される）
      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: content,
          subject,
          imageUrl: images?.[0]?.url,
          conversationHistory,
          model: currentModel,
          userId: profile.id
        }
      });

      if (error) {
        throw error;
      }

      // AIメッセージ作成
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        subject,
        conversation_id: conversationId,
        model: data.model,
        cost: data.cost,
      };

      setMessages(prev => [...prev, aiMessage]);

      // AIメッセージをデータベースに保存
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: data.response,
          role: 'assistant',
          created_at: new Date().toISOString(),
          cost: data.cost || 0,
          model: data.model
        });

      if (aiMessageError) {
        console.error('AIメッセージ保存失敗:', aiMessageError);
      }

      // ストリークデータ更新をトリガー
      console.log('🔄 ストリークデータ更新トリガー...');
      if (onStreakUpdate) {
        onStreakUpdate();
      }

      console.log('✅ メッセージ送信とストリーク更新成功');

    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, profile, subject, currentModel, selectedConversationId, setSelectedConversationId, createConversation, toast, onUrlUpdate, onStreakUpdate]);

  const handleUnderstood = useCallback(async () => {
    if (!selectedConversationId) return;

    try {
      // 会話を理解済みとして更新
      await updateConversation(selectedConversationId, null, true);
      setConversationUnderstood(true);
      
      // 紙吹雪エフェクトをトリガー
      if (onConfettiTrigger) {
        onConfettiTrigger();
      }
      
      // 完全な会話で自動タグ付けを実行
      const taggingSuccess = await performAutoTagging(selectedConversationId, messages);
      
      if (!taggingSuccess) {
        console.warn('⚠️ 自動タグ付けは成功しませんでしたが、会話は理解済みとしてマークされました');
      }
      
    } catch (error) {
      console.error("❌ 会話更新失敗:", error);
      toast({
        title: "エラー",
        description: "理解したことの記録に失敗しました。",
        variant: "destructive",
      });
    }
  }, [selectedConversationId, updateConversation, setConversationUnderstood, onConfettiTrigger, toast, messages, performAutoTagging]);

  return {
    messages,
    setMessages,
    isLoading,
    isTagging,
    handleSendMessage,
    handleUnderstood,
  };
};
