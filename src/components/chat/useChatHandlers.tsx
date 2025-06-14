
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { MessageType, ImageData } from "./types";

export function useChatHandlers(props: {
  userId: string | undefined,
  subject: string,
  refetchConversations: () => void,
  selectedConversationId: string | null,
  setSelectedConversationId: (id: string | null) => void,
  messages: MessageType[],
  setMessages: (msgs: MessageType[]) => void,
  setIsLoading: (loading: boolean) => void,
  setShowConfetti: (show: boolean) => void,
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ... extract params
  const {
    userId, subject, refetchConversations,
    selectedConversationId, setSelectedConversationId,
    messages, setMessages,
    setIsLoading, setShowConfetti,
  } = props;

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

    setMessages([...messages, userMessage]);
    setIsLoading(true);

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

      setMessages([...messages, userMessage, aiMessage]);

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

  const handleUnderstood = async (messageId: string) => {
    if (!userId) return;

    try {
      setMessages(
        messages.map(msg =>
          msg.id === messageId
            ? { ...msg, isUnderstood: true }
            : msg
        )
      );

      // Update in database
      // ... omitted for brevity, same as in main code

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

  // 他handlerも同様にまとめられる

  return {
    handleSendMessage,
    handleUnderstood,
    // ...他のhandler追加可能
  };
}
