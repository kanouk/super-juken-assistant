import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { MessageType, ImageData } from './types';
import { useChatStats } from "@/hooks/useChatStats";

// モデルの全オプション
const allModelOptions = [
  { label: "GPT-4.1 (2025-04-14)", value: "gpt-4.1-2025-04-14", service: "openai"},
  { label: "O3 (2025-04-16)", value: "o3-2025-04-16", service: "openai" },
  { label: "O4 Mini (2025-04-16)", value: "o4-mini-2025-04-16", service: "openai" },
  { label: "GPT-4o（旧モデル）", value: "gpt-4o", service: "openai" },
  { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro", service: "google" },
  { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro", service: "google" },
  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash", service: "google" },
  { label: "Sonnet 4 (2025-05-14)", value: "claude-sonnet-4-20250514", service: "anthropic" },
  { label: "Opus 4 (2025-05-14)", value: "claude-opus-4-20250514", service: "anthropic" },
  { label: "3.5 Haiku (2024-10-22)", value: "claude-3-5-haiku-20241022", service: "anthropic" },
  { label: "3.7 Sonnet (2025-02-19)", value: "claude-3-7-sonnet-20250219", service: "anthropic" },
  { label: "3 Sonnet（旧モデル）", value: "claude-3-sonnet", service: "anthropic" },
  { label: "3 Haiku（旧モデル）", value: "claude-3-haiku", service: "anthropic" },
  { label: "3 Opus（旧モデル）", value: "claude-3-opus", service: "anthropic" },
];

// Props for the hook
export interface UseChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  userId: string | undefined;
  onSubjectChange?: (subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  availableModels?: {
    openai?: { label: string; value: string };
    google?: { label: string; value: string };
    anthropic?: { label: string; value: string };
  };
  onModelChange?: (value: string) => void;
}

export function useChatScreen(props: UseChatScreenProps) {
  const { 
    subject, subjectName, currentModel, userId, 
    onToggleSidebar, isMobile, availableModels,
    onModelChange 
  } = props;
  // 🔽 選択中モデルは必ずprops.currentModelで初期化し、その後ローカルで管理
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationUnderstood, setConversationUnderstood] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // モデルフィルタ
  const selectedModelsObj = availableModels;
  const filteredModelOptions = allModelOptions.filter(opt => (
    (!selectedModelsObj?.openai || opt.value === selectedModelsObj.openai.value) ||
    (!selectedModelsObj?.google || opt.value === selectedModelsObj.google.value) ||
    (!selectedModelsObj?.anthropic || opt.value === selectedModelsObj.anthropic.value)
  ));
  const displayModelOptions = filteredModelOptions.length > 0 ? filteredModelOptions : allModelOptions;

  // 会話リスト
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', userId, subject],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // サイドバー用: ChatStats取得
  // 会話リストの統計管理はMainAppが担うためここでinvalidateは不要
  const { understoodCount, dailyCost, totalCost, dailyQuestions, isLoading: isLoadingStats, error: chatStatsError, refetch: refetchChatStats } = useChatStats(userId);

  useEffect(() => {
    setMessages([]);
    setSelectedConversationId(null);
    setShowConversations(false);
    setConversationUnderstood(false);
  }, [subject]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // メッセージが追加された時は常にスクロール
    if (messages.length > 0) {
      // 少し遅延を入れてDOMの更新を待つ
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  // モデル変更
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    if (onModelChange) {
      onModelChange(value); // プロップから来た場合は伝播する
    }
  };

  // メッセージ送信
  const handleSendMessage = async (content: string, images: ImageData[] = []) => {
    if (!content.trim() && images.length === 0) return;
    if (!userId) {
      toast({
        title: "エラー",
        description: "ユーザーが認証されていません。",
        variant: "destructive",
      });
      return;
    }

    // 会話が理解済みの場合は新しいメッセージを送信できない
    if (conversationUnderstood) {
      toast({
        title: "この質問は理解済みです",
        description: "新しい質問を始めるには「新規チャット」を押してください。",
        variant: "destructive",
      });
      return;
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      images: images.length > 0 ? images : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSelectedImages([]);

    try {
      let conversationId = selectedConversationId;
      
      if (!conversationId) {
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            id: uuidv4(),
            user_id: userId,
            subject: subject,
            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            created_at: new Date().toISOString(),
            is_understood: false
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
        setSelectedConversationId(conversationId);
        setConversationUnderstood(false);
        refetchConversations();
      }

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: content,
          role: 'user',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // 会話履歴を正しい形式で構築（role形式で送信）
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      // モデル（selectedModel）をAIへ必ず渡す
      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: content,
          subject: subject,
          conversationHistory: conversationHistory,
          images: images.length > 0 ? images : undefined,
          userId: userId,
          model: selectedModel
        }
      });

      if (error) throw error;

      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        isUnderstood: false,
      };

      setMessages(prev => [...prev, aiMessage]);

      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: data.response,
          role: 'assistant',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;

      // AIメッセージのIDをデータベースのIDに更新
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, id: aiMessageData.id.toString() }
            : msg
        )
      );

      refetchConversations();

      // メッセージ送信後、確実にスクロール
      setTimeout(() => {
        scrollToBottom();
      }, 200);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "エラー",
        description: `メッセージの送信に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 理解した！ハンドラ（データベースIDを使用）
  const handleUnderstood = async () => {
    if (!userId || !selectedConversationId) return;
    
    console.log('Understanding conversation with ID:', selectedConversationId);
    
    try {
      // まずUIを更新
      setConversationUnderstood(true);

      // データベースの会話を理解済みに更新
      const { error } = await supabase
        .from('conversations')
        .update({ is_understood: true })
        .eq('id', selectedConversationId);

      if (error) {
        console.error('Database update error:', error);
        // エラーの場合はUIを元に戻す
        setConversationUnderstood(false);
        throw error;
      }

      console.log('Successfully updated conversation as understood:', selectedConversationId);
      
      // ChatStatsを再取得してサイドバーの統計を更新
      refetchChatStats();
      refetchConversations();
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      toast({
        title: "完全に理解！",
        description: "この質問は理解済みになりました！",
      });

    } catch (error: any) {
      console.error('Error updating understood status:', error);
      toast({
        title: "エラー",
        description: "理解度の更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedConversationId(null);
    setShowConversations(false);
    setConversationUnderstood(false);
  };

  const handleShowHistory = () => {
    setShowConversations(true);
  };

  const handleBackToChat = () => {
    setShowConversations(false);
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      // 会話の詳細を取得
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('is_understood')
        .eq('id', conversationId)
        .single();

      if (conversationError) throw conversationError;

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: MessageType[] = messagesData.map((msg) => ({
        id: msg.id.toString(),
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.created_at),
        images: msg.image_url ? [{ url: msg.image_url }] : undefined,
      }));

      setMessages(formattedMessages);
      setSelectedConversationId(conversationId);
      setConversationUnderstood(conversationData.is_understood || false);
      setShowConversations(false);
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "会話の読み込みに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (selectedConversationId === conversationId) {
        setMessages([]);
        setSelectedConversationId(null);
      }

      refetchConversations();
      toast({
        title: "削除完了",
        description: "会話が削除されました。",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "会話の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
    // QuickAction実行後も確実にスクロール
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  return {
    state: {
      subject,
      subjectName,
      messages,
      isLoading,
      selectedImages,
      showConfetti,
      showConversations,
      selectedConversationId,
      selectedModel,
      displayModelOptions,
      conversations,
      understoodCount,
      dailyCost,
      totalCost,
      dailyQuestions,
      isLoadingStats,
      chatStatsError,
      messagesEndRef,
      conversationUnderstood,
    },
    handlers: {
      setSelectedImages,
      handleModelChange,
      handleSendMessage,
      handleUnderstood,
      handleNewChat,
      handleShowHistory,
      handleBackToChat,
      handleSelectConversation,
      handleDeleteConversation,
      handleQuickAction,
      onToggleSidebar,
    }
  };
}
