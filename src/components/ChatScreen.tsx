
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
import { Message } from './chat/types'; // Import Message type

interface ChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  userId: string | undefined;
}

const ChatScreen = ({ subject, subjectName, currentModel, userId }: ChatScreenProps) => {
  const [allMessages, setAllMessages] = useState<{[key: string]: Message[]}>({});
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // fileInputRef is now inside MessageInput.tsx
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [latestAIMessageIdForActions, setLatestAIMessageIdForActions] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const messages = allMessages[subject] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clean up input when subject changes
  useEffect(() => {
    setInputText('');
    setSelectedImage(null);
    setImagePreview(null);
    setLatestAIMessageIdForActions(null);
  }, [subject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      reader.onload = (e_reader) => { // Renamed e to e_reader to avoid conflict
        setImagePreview(e_reader.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // No need to clear fileInputRef.current.value as it's managed by MessageInput
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !subject) return;
      setIsLoading(true);
      
      // メッセージ読み込み時に入力をクリア
      setInputText('');
      setSelectedImage(null);
      setImagePreview(null);
      setLatestAIMessageIdForActions(null);
      
      try {
        // 1. Find or create conversation
        let { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', userId)
          .eq('subject', subject)
          .single();

        if (convError && convError.code !== 'PGRST116') { // PGRST116: no rows found
          console.error('Error fetching conversation:', convError);
          throw convError;
        }

        if (!conversation) {
          setAllMessages(prev => ({ ...prev, [subject]: [] }));
          setIsLoading(false);
          return;
        }
        
        const { data: dbMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          throw messagesError;
        }
        
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

        setAllMessages(prev => ({
          ...prev,
          [subject]: fetchedMessages
        }));
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

    fetchMessages();
  }, [subject, userId, toast]);

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
    removeImage(); // This will clear selectedImage and imagePreview
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

    const updatedMessagesForSubject = [...(allMessages[subject] || []), userMessage];
    setAllMessages(prev => ({ ...prev, [subject]: updatedMessagesForSubject }));

    try {
      // 1. Find or create conversation
      let { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .eq('subject', subject)
        .single();

      if (convError && convError.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error finding conversation:', convError);
        throw convError;
      }

      if (!conversation) {
        const { data: newConversation, error: newConvError } = await supabase
          .from('conversations')
          .insert({ user_id: userId, subject: subject })
          .select('id')
          .single();
        if (newConvError || !newConversation) {
          console.error('Error creating conversation:', newConvError);
          throw newConvError || new Error("Failed to create conversation");
        }
        conversation = newConversation;
      }
      const conversationId = conversation.id;

      // 2. Upload image if exists
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

      // 3. Save user message to DB
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
        console.error('Error saving user message:', userMsgError);
        throw userMsgError || new Error("Failed to save user message");
      }
      
      setAllMessages(prev => ({
        ...prev,
        [subject]: prev[subject]?.map(msg => 
          msg.id === localUserMessageId ? { ...msg, db_id: dbUserMessage.id, id: dbUserMessage.id } : msg
        ) || []
      }));
      
      // 4. Call AI function
      const conversationHistoryForAI = (allMessages[subject] || [])
        .filter(msg => msg.id !== localUserMessageId || msg.db_id) // Ensure only messages with db_id or not the current local one are sent
        .map(msg => ({ // Reconstruct user message with db_id if available
          ...msg,
          id: msg.db_id || msg.id,
        }))
        .slice(-11) 
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          image_url: msg.image_url
        }));
      // Ensure the just-saved user message is part of history if it got db_id
      const finalUserMessageForHistory = {role: 'user', content: submittingText, image_url: imageUrlSupabase || undefined};
      const historyWithoutOptimistic = conversationHistoryForAI.filter(m => m.role !== 'user' || m.content !== submittingText); // crude way to remove temp user message
      const finalHistory = [...historyWithoutOptimistic, finalUserMessageForHistory].slice(-11);


      const { data: functionData, error: functionError } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: submittingText,
          subject: subject,
          imageUrl: imageUrlSupabase || undefined,
          conversationHistory: finalHistory, // Use finalHistory
          currentModel: currentModel,
        }
      });

      if (functionError) throw new Error(functionError.message || 'AI応答でエラーが発生しました');
      if (functionData.error) throw new Error(functionData.error);

      // 5. Save AI message to DB
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
        console.error('Error saving AI message:', aiMsgError);
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

      setAllMessages(prev => {
        const currentSubjectMessages = prev[subject] || [];
        const updatedUserMessageInPlace = currentSubjectMessages.map(msg => 
            msg.id === localUserMessageId ? { ...msg, db_id: dbUserMessage.id, id: dbUserMessage.id } : msg
        );
        // Filter out the local user message if it was by local ID and now we have the DB version, to avoid duplicates if map didn't catch it
        const withoutLocalUser = updatedUserMessageInPlace.filter(msg => msg.id !== localUserMessageId || msg.id === dbUserMessage.id);
        
        return {
          ...prev,
          [subject]: [...withoutLocalUser, aiMessage]
                       .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        };
      });

      // クイックアクションのIDを即座に設定
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
      setAllMessages(prev => ({
        ...prev,
        [subject]: prev[subject]?.filter(msg => msg.id !== localUserMessageId) || []
      }));
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

    // 現在のスクロール位置を保存
    const scrollContainer = scrollContainerRef.current;
    const currentScrollTop = scrollContainer?.scrollTop || 0;

    // Update the message state optimistically
    setAllMessages(prev => {
      const updatedSubjectMessages = (prev[subject] || []).map(msg =>
        msg.db_id === messageIdToUpdate ? { ...msg, is_understood: true } : msg
      );
      return { ...prev, [subject]: updatedSubjectMessages };
    });

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
        setAllMessages(prev => {
          const revertedSubjectMessages = (prev[subject] || []).map(msg =>
            msg.db_id === messageIdToUpdate ? { ...msg, is_understood: false } : msg
          );
          return { ...prev, [subject]: revertedSubjectMessages };
        });
        toast({
          title: "エラー",
          description: "「理解した」状態の保存に失敗しました。",
          variant: "destructive",
        });
      } else {
        // スクロール位置を元に戻す
        setTimeout(() => {
          if (scrollContainer) {
            scrollContainer.scrollTop = currentScrollTop;
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Failed to mark message as understood:', error);
       setAllMessages(prev => {
          const revertedSubjectMessages = (prev[subject] || []).map(msg =>
            msg.db_id === messageIdToUpdate ? { ...msg, is_understood: false } : msg
          );
          return { ...prev, [subject]: revertedSubjectMessages };
        });
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ConfettiComponent trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <ChatHeader subjectName={subjectName} currentModel={currentModel} />

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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
        
        {/* Show loading indicator if isLoading AND (either no messages yet OR it's not just the empty state loading) */}
        {isLoading && (messages.length > 0 || (messages.length === 0 && inputText)) && <ChatLoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
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
