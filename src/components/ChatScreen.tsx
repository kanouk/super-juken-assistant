import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import ConfettiComponent from './Confetti';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ChatHeader from './chat/ChatHeader';
import ConversationList from './chat/ConversationList';
import QuickActions from './chat/QuickActions';
import ChatEmptyState from './chat/ChatEmptyState';
import { MessageType, ImageData } from './chat/types';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import ChatMainView from "./chat/ChatMainView";
import ConversationHistoryView from "./chat/ConversationHistoryView";
import { useChatStats } from "@/hooks/useChatStats";

// ChatScreenコンポーネントprops
interface ChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  userId: string | undefined;
  onSubjectChange?: (subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  // 追加: modelOptionの配列型をpropsで受け取る
  availableModels?: {
    openai?: { label: string; value: string };
    google?: { label: string; value: string };
    anthropic?: { label: string; value: string };
  };
}

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

const ChatScreen = (props: ChatScreenProps) => {
  const { subject, subjectName, currentModel, userId, onSubjectChange, onToggleSidebar, isMobile } = props;
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 設定画面で指定されたモデルのみ表示
  const selectedModelsObj = props.availableModels;
  const filteredModelOptions = allModelOptions.filter(opt => (
    (!selectedModelsObj?.openai || opt.value === selectedModelsObj.openai.value) ||
    (!selectedModelsObj?.google || opt.value === selectedModelsObj.google.value) ||
    (!selectedModelsObj?.anthropic || opt.value === selectedModelsObj.anthropic.value)
  ));

  // 選べるモデルがなければデフォルト
  const displayModelOptions = filteredModelOptions.length > 0 ? filteredModelOptions : allModelOptions;

  // Clear messages when subject changes
  useEffect(() => {
    setMessages([]);
    setSelectedConversationId(null);
    setShowConversations(false);
  }, [subject]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // モデル変更イベント
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

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
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
        setSelectedConversationId(conversationId);
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

      // モデル（selectedModel）をAIへ必ず渡すように修正
      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: content,
          subject: subject,
          conversationHistory: messages.map(msg => ({
            content: msg.content,
            isUser: msg.isUser
          })),
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

      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: data.response,
          role: 'assistant',
          created_at: new Date().toISOString()
        });

      refetchConversations();

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

  // サイドバー用: ChatStats取得
  const { understoodCount, dailyCost, totalCost, dailyQuestions, isLoading: isLoadingStats, error: chatStatsError, refetch: refetchChatStats } = useChatStats(userId);

  const handleUnderstood = async (messageId: string) => {
    if (!userId) return;
    try {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isUnderstood: true }
            : msg
        )
      );
      // ... keep existing messages update logic the same ...
      const message = messages.find(msg => msg.id === messageId);
      if (message && selectedConversationId) {
        const { error } = await supabase
          .from('messages')
          .update({ is_understood: true })
          .eq('conversation_id', selectedConversationId)
          .eq('content', message.content)
          .eq('role', 'assistant');
        if (!error) {
          // --- ここでサイドバー統計キャッシュを即座にリフレッシュする
          refetchChatStats();
          queryClient.invalidateQueries({ queryKey: ['chatStats', userId] });
        }
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast({
        title: "完全に理解！",
        description: "理解度がカウントされました！",
      });
    } catch (error: any) {
      // ... keep error handling the same ...
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
  };

  const handleShowHistory = () => {
    setShowConversations(true);
  };

  const handleBackToChat = () => {
    setShowConversations(false);
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: MessageType[] = messagesData.map(msg => ({
        id: msg.id.toString(),
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.created_at),
        images: msg.image_url ? [{ url: msg.image_url }] : undefined,
        isUnderstood: msg.is_understood || false,
      }));

      setMessages(formattedMessages);
      setSelectedConversationId(conversationId);
      setShowConversations(false);
    } catch (error: any) {
      console.error('Error loading conversation:', error);
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
      console.error('Error deleting conversation:', error);
      toast({
        title: "エラー",
        description: "会話の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  if (showConversations) {
    return (
      <ConversationHistoryView
        subject={subject}
        subjectName={subjectName}
        currentModel={selectedModel}
        modelOptions={displayModelOptions}
        onModelChange={handleModelChange}
        onBackToList={handleBackToChat}
        onToggleSidebar={onToggleSidebar}
        isMobile={isMobile}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
      />
    );
  }

  return (
    <ChatMainView
      subject={subject}
      subjectName={subjectName}
      currentModel={selectedModel}
      modelOptions={displayModelOptions}
      messages={messages}
      isLoading={isLoading}
      selectedImages={selectedImages}
      setSelectedImages={setSelectedImages}
      onSendMessage={handleSendMessage}
      onUnderstood={handleUnderstood}
      onQuickAction={handleQuickAction}
      showConfetti={showConfetti}
      onNewChat={handleNewChat}
      onShowHistory={handleShowHistory}
      showNewChatButton={messages.length > 0}
      showHistoryButton={conversations.length > 0}
      onToggleSidebar={onToggleSidebar}
      isMobile={isMobile}
      messagesEndRef={messagesEndRef}
    />
  );
};

export default ChatScreen;

// このファイルが長大化してきているので、今後リファクタをおすすめします。
