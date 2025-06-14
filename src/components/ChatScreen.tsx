import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Send, X, Bot, User, ThumbsUp, Brain, Sparkles, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TypewriterEffect from './TypewriterEffect';
import ConfettiComponent from './Confetti';
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Message } from '@/integrations/supabase/types';

interface Message {
  id: string; // This can be a local ID for optimistic updates, or Supabase UUID
  db_id?: string; // Store Supabase message ID here if available
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  cost?: number;
  model?: string;
  created_at: string;
  subject: string;
  is_understood?: boolean; // Added for "fully understood" tracking
}

interface ChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  userId: string | undefined; // Add userId prop
}

const ChatScreen = ({ subject, subjectName, currentModel, userId }: ChatScreenProps) => {
  // 科目ごとに分離されたメッセージ状態
  const [allMessages, setAllMessages] = useState<{[key: string]: Message[]}>({});
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [latestAIMessageIdForActions, setLatestAIMessageIdForActions] = useState<string | null>(null); // This should store the db_id of the AI message
  const [showConfetti, setShowConfetti] = useState(false);

  // 現在の科目のメッセージを取得
  const messages = allMessages[subject] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Fetch initial messages for the current subject and user
    const fetchMessages = async () => {
      if (!userId || !subject) return;
      setIsLoading(true);
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
          // No conversation exists, so no messages to fetch yet
          setAllMessages(prev => ({ ...prev, [subject]: [] }));
          setIsLoading(false);
          return;
        }
        
        // 2. Fetch messages for the conversation
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
          id: msg.id, // Use Supabase ID as the primary ID
          db_id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          image_url: msg.image_url || undefined,
          cost: msg.cost || undefined,
          model: msg.model || undefined,
          created_at: msg.created_at,
          subject: subject, // Assuming subject is consistent for this conversation
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

    // Optimistic update
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
        const fileName = `${userId}/${Date.now()}.${fileExt}`; // User-specific path
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-images') // Ensure this bucket exists and has correct policies
          .upload(fileName, submittingImageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue without image if upload fails, or handle more gracefully
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
      
      // Update local user message with DB ID
      setAllMessages(prev => ({
        ...prev,
        [subject]: prev[subject]?.map(msg => 
          msg.id === localUserMessageId ? { ...msg, db_id: dbUserMessage.id, id: dbUserMessage.id } : msg
        ) || []
      }));
      
      // 4. Call AI function
      const conversationHistoryForAI = (allMessages[subject] || [])
        .slice(-11) // Include the latest user message for context
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          image_url: msg.image_url
        }));

      const { data: functionData, error: functionError } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: submittingText,
          subject: subject,
          imageUrl: imageUrlSupabase || undefined,
          conversationHistory: conversationHistoryForAI,
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
        id: dbAiMessage.id, // Use Supabase ID
        db_id: dbAiMessage.id,
        role: 'assistant',
        content: aiMessageContent,
        cost: functionData.cost,
        model: functionData.model,
        created_at: dbAiMessage.created_at,
        subject: subject,
        is_understood: false,
      };

      setAllMessages(prev => ({
        ...prev,
        [subject]: [...(prev[subject] || []).filter(m => m.id !== localUserMessageId), // Remove local user message if still present by local ID
                     ...(prev[subject] || []).map(m => m.id === dbUserMessage.id ? { ...m, id: dbUserMessage.id, db_id: dbUserMessage.id } : m), // Ensure user message has db_id
                     aiMessage] 
                     .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Re-sort after adding AI message
      }));

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
      // Restore input
      setInputText(submittingText);
      if (submittingImagePreview) {
        setImagePreview(submittingImagePreview);
        // This line was causing an error because submittingImageFile could be null.
        // Corrected to ensure it's only set if it exists.
        if (submittingImageFile) {
           setSelectedImage(submittingImageFile);
        }
      }
      // Remove optimistic user message on error
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
    if (!latestAIMessageIdForActions) return; // This should be the db_id of the AI message

    const messageIdToUpdate = latestAIMessageIdForActions;
    setLatestAIMessageIdForActions(null); // Clear after use

    // Optimistic UI update
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
        .eq('id', messageIdToUpdate); // Use db_id for update

      if (error) {
        console.error('Error updating message "is_understood":', error);
        // Revert optimistic update on error
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
      }
    } catch (error: any) {
      console.error('Failed to mark message as understood:', error);
      // Revert optimistic update
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ConfettiComponent trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{subjectName}</h2>
            <p className="text-sm text-gray-600">現在のモデル: {currentModel}</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            AI チャット中
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? ( // Added !isLoading to prevent empty state during initial load
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {subjectName}の学習を始めましょう
            </h3>
            <p className="text-gray-600">
              質問や画像を送信して、AIと対話してみてください。
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}> {/* Using message.id (which could be local or db_id) as key */}
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                  message.role === 'assistant' ? 'animate-fade-in' : ''
                }`}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={
                      message.role === 'user' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-gray-100 border-gray-200 text-gray-900'
                  }`}>
                    <CardContent className="p-3">
                      {message.image_url && (
                        <img 
                          src={message.image_url} 
                          alt="Attached image"
                          className="max-w-xs rounded-lg mb-2"
                        />
                      )}
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <TypewriterEffect
                          content={message.content} 
                          className="text-base" // フォントサイズをtext-baseに変更して少し大きく
                          speed={20}
                          onComplete={() => {
                            // Only set if it's the last AI message and has a db_id
                            const currentMessagesForSubject = allMessages[subject] || [];
                            const lastMessageInSubject = currentMessagesForSubject[currentMessagesForSubject.length - 1];
                            if (lastMessageInSubject && lastMessageInSubject.id === message.id && lastMessageInSubject.role === 'assistant' && lastMessageInSubject.db_id) {
                              setLatestAIMessageIdForActions(lastMessageInSubject.db_id);
                            }
                          }}
                        />
                      )}
                      {message.role === 'assistant' && (message.cost || message.model) && (
                        <div className="mt-2 pt-2">
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{message.model || 'N/A'}</span>
                            {message.cost && (
                              <span className="text-xs text-gray-500">¥{message.cost.toFixed(4)}</span>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-gray-500 hover:text-gray-700"
                              onClick={() => handleCopyToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              {message.role === 'assistant' && message.db_id === latestAIMessageIdForActions && ( // Check against db_id
                <div className="mt-2 flex flex-wrap gap-2 justify-start pl-11 pb-2">
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction('もっとわかりやすく教えてください')} className="text-xs">
                    <Brain className="mr-1 h-3 w-3" /> もっとわかりやすく
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction('具体例をあげてください')} className="text-xs">
                    <Sparkles className="mr-1 h-3 w-3" /> 具体例を教えて
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleUnderstood} className="text-xs">
                    <ThumbsUp className="mr-1 h-3 w-3" /> 完全に理解した！
                    {message.is_understood && <CheckCircle className="ml-1 h-3 w-3 text-green-500" />} {/* Show check if understood */}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && messages.length > 0 && ( // Show loading indicator only if there are already messages, or adjust as needed
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-2xl">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-green-100 text-green-700">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-gray-100 border-gray-200 text-gray-900">
                <CardContent className="p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-4">
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-32 max-h-32 rounded-lg border border-gray-200"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (e.target.value.trim() !== '') {
                  setLatestAIMessageIdForActions(null);
                }
              }}
              placeholder={`${subjectName}について質問してください...`}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (inputText.trim() || selectedImage) {
                    handleSubmit(e as any);
                  }
                }
              }}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatScreen;
