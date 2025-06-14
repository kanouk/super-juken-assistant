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

interface ChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  userId: string | undefined;
  onSubjectChange?: (subject: string) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const ChatScreen = ({ subject, subjectName, currentModel, userId, onSubjectChange, onToggleSidebar, isMobile }: ChatScreenProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', userId, subject],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('subject', subject)
        .order('updated_at', { ascending: false });

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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
          is_user: true,
          images: images.length > 0 ? images : null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (messageError) throw messageError;

      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: content,
          subject: subject,
          conversationHistory: messages.map(msg => ({
            content: msg.content,
            isUser: msg.isUser
          })),
          images: images.length > 0 ? images : undefined,
          userId: userId
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
          is_user: false,
          created_at: new Date().toISOString()
        });

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

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

      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          understood_count: 1
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });

      if (error) {
        const { data: existingStats } = await supabase
          .from('user_stats')
          .select('understood_count')
          .eq('user_id', userId)
          .eq('date', new Date().toISOString().split('T')[0])
          .single();

        if (existingStats) {
          await supabase
            .from('user_stats')
            .update({ 
              understood_count: (existingStats.understood_count || 0) + 1 
            })
            .eq('user_id', userId)
            .eq('date', new Date().toISOString().split('T')[0]);
        }
      }

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      toast({
        title: "完全に理解！",
        description: "理解度がカウントされました！",
      });

    } catch (error: any) {
      console.error('Error updating understood count:', error);
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
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at),
        images: msg.images || undefined,
        isUnderstood: false,
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

  if (showConversations) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader 
          subjectName={`${subjectName} - 会話履歴`}
          currentModel={currentModel}
          onBackToList={handleBackToChat}
          showBackButton={true}
          onToggleSidebar={onToggleSidebar}
          isMobile={isMobile}
        />
        <ConversationList 
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewChat={handleNewChat}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {showConfetti && <ConfettiComponent />}
      
      <ChatHeader 
        subjectName={subjectName}
        currentModel={currentModel}
        onNewChat={handleNewChat}
        onShowHistory={handleShowHistory}
        showNewChatButton={messages.length > 0}
        showHistoryButton={conversations.length > 0}
        onToggleSidebar={onToggleSidebar}
        isMobile={isMobile}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col">
            <ChatEmptyState subjectName={subjectName} />
            <QuickActions 
              onQuickAction={handleSendMessage}
              subject={subject}
            />
          </div>
        ) : (
          <MessageList 
            messages={messages}
            isLoading={isLoading}
            onUnderstood={handleUnderstood}
            messagesEndRef={messagesEndRef}
          />
        )}
        
        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedImages={selectedImages}
          onImagesChange={setSelectedImages}
        />
      </div>
    </div>
  );
};

export default ChatScreen;
