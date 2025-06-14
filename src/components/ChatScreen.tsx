import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import ConfettiComponent from './Confetti';
import { supabase } from "@/integrations/supabase/client";

// New imports for refactored components
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import ChatEmptyState from './chat/ChatEmptyState';
import ChatLoadingIndicator from './chat/ChatLoadingIndicator';
import ImagePreviewDisplay from './chat/ImagePreviewDisplay';
import MessageInput from './chat/MessageInput';
import ConversationList from './chat/ConversationList';
import { Message } from './chat/types'; // Import Message type

interface ChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  userId: string | undefined;
}

const ChatScreen = ({ subject, subjectName, currentModel, userId }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [latestAIMessageIdForActions, setLatestAIMessageIdForActions] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      if (messagesEndRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Only scroll if there's content that requires scrolling
        if (scrollHeight > clientHeight) {
          container.scrollTop = scrollHeight - clientHeight;
        }
      }
    });
  };

  // Clean up input when subject changes
  useEffect(() => {
    setInputText('');
    setSelectedImage(null);
    setImagePreview(null);
    setLatestAIMessageIdForActions(null);
    setCurrentConversationId(null);
    setMessages([]);
    setShowConversationList(false);
  }, [subject]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // 新規チャット開始時のタイトル生成 - 教科名を削除
  const generateConversationTitle = (firstMessage: string): string => {
    const truncatedMessage = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
    
    return truncatedMessage;
  };

  const handleSelectConversation = async (conversationId: string | null) => {
    if (conversationId === null) {
      // 新規チャット
      setCurrentConversationId(null);
      setMessages([]);
      setInputText('');
      setSelectedImage(null);
      setImagePreview(null);
      setLatestAIMessageIdForActions(null);
      setShowConversationList(false);
    } else {
      // 既存の会話を読み込み
      setCurrentConversationId(conversationId);
      setShowConversationList(false);
      await loadConversationMessages(conversationId);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    if (!userId) return;
    setIsLoading(true);
    
    try {
      const { data: dbMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const fetchedMessages: Message[] = dbMessages.map(msg => ({
        id: msg.id, 
        db_id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        image_url: msg.image_url || undefined,
        cost: msg.cost || undefined,
        model: msg.model || undefined,
        created_at: msg.created_at,
        subject: subject, 
        is_understood: msg.is_understood || false,
      }));

      setMessages(fetchedMessages);
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "メッセージの読み込みに失敗しました: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ファイルサイズエラー",
          description: "画像ファイルは5MB以下にしてください。",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e_reader) => {
        setImagePreview(e_reader.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>, explicitText?: string) => {
    e.preventDefault();
    setLatestAIMessageIdForActions(null);

    if (!userId) {
      toast({ title: "エラー", description: "ユーザー情報が取得できません。", variant: "destructive" });
      return;
    }

    const textForSubmission = explicitText !== undefined ? explicitText : inputText;
    const imageForSubmission = selectedImage;
    const imagePreviewForSubmission = imagePreview;

    if (!textForSubmission.trim() && !imageForSubmission) {
      return;
    }

    const submittingText = textForSubmission;
    const submittingImageFile = imageForSubmission;
    const submittingImagePreview = imagePreviewForSubmission;

    setInputText('');
    removeImage();
    setIsLoading(true);

    const localUserMessageId = `local-${Date.now()}`;
    const userMessage: Message = {
      id: localUserMessageId,
      role: 'user',
      content: submittingText,
      image_url: submittingImagePreview || undefined,
      created_at: new Date().toISOString(),
      subject: subject,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let conversationId = currentConversationId;
      
      // 新規チャットの場合、会話を作成
      if (!conversationId) {
        const conversationTitle = generateConversationTitle(submittingText);
        const { data: newConversation, error: newConvError } = await supabase
          .from('conversations')
          .insert({ 
            user_id: userId, 
            subject: subject,
            title: conversationTitle
          })
          .select('id')
          .single();
        
        if (newConvError || !newConversation) {
          throw newConvError || new Error("Failed to create conversation");
        }
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      }

      // 画像アップロード処理
      let imageUrlSupabase = '';
      if (submittingImageFile) {
        const fileExt = submittingImageFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-images')
          .upload(fileName, submittingImageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('message-images')
            .getPublicUrl(fileName);
          imageUrlSupabase = data.publicUrl;
        }
      }

      // ユーザーメッセージをDBに保存
      const { data: dbUserMessage, error: userMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: submittingText,
          image_url: imageUrlSupabase || null,
          created_at: userMessage.created_at,
        })
        .select()
        .single();

      if (userMsgError || !dbUserMessage) {
        throw userMsgError || new Error("Failed to save user message");
      }
      
      // ローカルメッセージを更新
      setMessages(prev => prev.map(msg => 
        msg.id === localUserMessageId ? { ...msg, db_id: dbUserMessage.id, id: dbUserMessage.id } : msg
      ));
      
      // AI関数を呼び出し
      const conversationHistory = messages
        .slice(-10) 
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          image_url: msg.image_url
        }));
      
      const finalHistory = [...conversationHistory, {
        role: 'user' as const, 
        content: submittingText, 
        image_url: imageUrlSupabase || undefined
      }];

      const { data: functionData, error: functionError } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: submittingText,
          subject: subject,
          imageUrl: imageUrlSupabase || undefined,
          conversationHistory: finalHistory,
          currentModel: currentModel,
        }
      });

      if (functionError) throw new Error(functionError.message || 'AI応答でエラーが発生しました');
      if (functionData.error) throw new Error(functionData.error);

      // AIメッセージをDBに保存
      const aiMessageContent = functionData.response;
      const { data: dbAiMessage, error: aiMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiMessageContent,
          cost: functionData.cost,
          model: functionData.model,
          created_at: new Date().toISOString(),
          is_understood: false, 
        })
        .select()
        .single();

      if (aiMsgError || !dbAiMessage) {
        throw aiMsgError || new Error("Failed to save AI message");
      }
      
      const aiMessage: Message = {
        id: dbAiMessage.id,
        db_id: dbAiMessage.id,
        role: 'assistant',
        content: aiMessageContent,
        cost: functionData.cost,
        model: functionData.model,
        created_at: dbAiMessage.created_at,
        subject: subject,
        is_understood: dbAiMessage.is_understood || false,
      };

      setMessages(prev => [...prev, aiMessage]);
      setLatestAIMessageIdForActions(dbAiMessage.id);

      toast({
        title: "回答を生成しました",
        description: `コスト: ¥${functionData.cost.toFixed(4)}`,
      });

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "エラー",
        description: error.message || "メッセージの送信に失敗しました。",
        variant: "destructive",
      });
      setInputText(submittingText);
      if (submittingImagePreview) {
        setImagePreview(submittingImagePreview);
        if (submittingImageFile) {
           setSelectedImage(submittingImageFile);
        }
      }
      setMessages(prev => prev.filter(msg => msg.id !== localUserMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (prompt: string) => {
    if (isLoading) return;
    setLatestAIMessageIdForActions(null);
    const dummyEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
    await handleSubmit(dummyEvent, prompt);
  };

  const handleUnderstood = async () => {
    if (!latestAIMessageIdForActions) return;
    const messageIdToUpdate = latestAIMessageIdForActions;
    setLatestAIMessageIdForActions(null);

    setMessages(prev => prev.map(msg =>
      msg.db_id === messageIdToUpdate ? { ...msg, is_understood: true } : msg
    ));

    setShowConfetti(true);
    toast({
      title: "完全に理解しました！ 🎉",
      description: "素晴らしいです！次のステップに進みましょう。",
      duration: 3000,
    });

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_understood: true })
        .eq('id', messageIdToUpdate);

      if (error) {
        console.error('Error updating message "is_understood":', error);
        setMessages(prev => prev.map(msg =>
          msg.db_id === messageIdToUpdate ? { ...msg, is_understood: false } : msg
        ));
        toast({
          title: "エラー",
          description: "「理解した」状態の保存に失敗しました。",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Failed to mark message as understood:', error);
      setMessages(prev => prev.map(msg =>
        msg.db_id === messageIdToUpdate ? { ...msg, is_understood: false } : msg
      ));
      toast({
        title: "エラー",
        description: "「理解した」状態の保存中に予期せぬエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "コピーしました",
        description: "回答内容をクリップボードにコピーしました。",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "コピー失敗",
        description: "クリップボードへのコピーに失敗しました。",
        variant: "destructive",
      });
    });
  };
  
  const handleTypewriterComplete = (messageDbId?: string) => {
    // タイプライター効果を削除したため、この関数は何もしない
  };

  const handleInputTextChange = (text: string) => {
    setInputText(text);
    if (text.trim() !== '') {
        setLatestAIMessageIdForActions(null);
    }
  };

  if (showConversationList) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ChatHeader subjectName={subjectName} currentModel={currentModel} />
        <div className="flex-1 p-4 overflow-hidden">
          <ConversationList
            subject={subject}
            subjectName={subjectName}
            userId={userId}
            onSelectConversation={handleSelectConversation}
            currentConversationId={currentConversationId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ConfettiComponent trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <ChatHeader 
        subjectName={subjectName} 
        currentModel={currentModel}
        onBackToList={() => setShowConversationList(true)}
        onNewChat={() => handleSelectConversation(null)}
        onShowHistory={() => setShowConversationList(true)}
        showBackButton={false}
        showNewChatButton={false}
        showHistoryButton={true}
      />

      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.length === 0 && !isLoading ? (
          <ChatEmptyState subjectName={subjectName} />
        ) : (
          <MessageList
            messages={messages}
            latestAIMessageIdForActions={latestAIMessageIdForActions}
            onCopyToClipboard={handleCopyToClipboard}
            onTypewriterComplete={handleTypewriterComplete}
            onQuickAction={handleQuickAction}
            onUnderstood={handleUnderstood}
          />
        )}
        
        {isLoading && (messages.length > 0 || (messages.length === 0 && inputText)) && <ChatLoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        {imagePreview && (
          <ImagePreviewDisplay imagePreview={imagePreview} onRemoveImage={removeImage} />
        )}
        
        <MessageInput
          inputText={inputText}
          onInputChange={handleInputTextChange}
          onSubmit={handleSubmit}
          onImageSelect={handleImageSelect}
          isLoading={isLoading}
          subjectName={subjectName}
          hasSelectedImage={!!selectedImage}
        />
      </div>
    </div>
  );
};

export default ChatScreen;
