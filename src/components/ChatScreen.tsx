import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Send, X, Bot, User, ThumbsUp, Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LaTeXRenderer from "./LaTeXRenderer";
import TypewriterEffect from './TypewriterEffect';
import ConfettiComponent from './Confetti';
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  cost?: number;
  model?: string;
  created_at: string;
  subject: string; // 科目を追加
}

interface ChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
}

const ChatScreen = ({ subject, subjectName, currentModel }: ChatScreenProps) => {
  // 科目ごとに分離されたメッセージ状態
  const [allMessages, setAllMessages] = useState<{[key: string]: Message[]}>({});
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>, explicitText?: string) => {
    e.preventDefault();
    setLatestAIMessageIdForActions(null); // Always clear actions on new submission

    const textForSubmission = explicitText !== undefined ? explicitText : inputText;
    const imageForSubmission = selectedImage;
    const imagePreviewForSubmission = imagePreview;

    if (!textForSubmission.trim() && !imageForSubmission) {
      return;
    }

    const currentInputTextForUserMessage = textForSubmission;
    const currentImagePreviewForUserMessage = imagePreviewForSubmission;
    // Storing values to be used for sending the message and for potential restoration on error
    const submittingText = textForSubmission; 
    const submittingImageFile = imageForSubmission;
    const submittingImagePreview = imagePreviewForSubmission;


    setInputText(''); 
    removeImage();    
    setIsLoading(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: currentInputTextForUserMessage, // Use the captured text for the user message
        image_url: currentImagePreviewForUserMessage || undefined, // Use captured image preview
        created_at: new Date().toISOString(),
        subject: subject,
      };

      const updatedMessagesForSubject = [...(allMessages[subject] || []), userMessage];
      
      setAllMessages(prev => ({
        ...prev,
        [subject]: updatedMessagesForSubject
      }));

      let imageUrlSupabase = '';
      if (submittingImageFile) { // Use submittingImageFile for upload
        const fileExt = submittingImageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, submittingImageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);
          imageUrlSupabase = data.publicUrl;
        }
      }

      const conversationHistory = updatedMessagesForSubject
        .slice(-11, -1) 
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          image_url: msg.image_url 
        }));
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('ask-ai', {
        body: {
          message: submittingText, // Use submittingText for AI
          subject: subject,
          imageUrl: imageUrlSupabase || undefined, 
          conversationHistory: conversationHistory,
          currentModel: currentModel,
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'AI応答でエラーが発生しました');
      }

      if (functionData.error) {
        throw new Error(functionData.error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: functionData.response,
        cost: functionData.cost,
        model: functionData.model,
        created_at: new Date().toISOString(),
        subject: subject,
      };

      setAllMessages(prev => ({
        ...prev,
        [subject]: [...updatedMessagesForSubject, aiMessage]
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
      
      // Restore input using the values captured at the start of submission
      setInputText(submittingText);
      if (submittingImagePreview) {
        setImagePreview(submittingImagePreview);
        setSelectedImage(submittingImageFile);
      }
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

  const handleUnderstood = () => {
    setShowConfetti(true);
    setLatestAIMessageIdForActions(null);
    toast({
      title: "完全に理解しました！ 🎉",
      description: "素晴らしいです！次のステップに進みましょう。",
      duration: 3000,
    });
    // Optionally, send a silent message or log this event
    // For example: console.log("User understood the explanation for message ID:", latestAIMessageIdForActions);
  };

  const [latestAIMessageIdForActions, setLatestAIMessageIdForActions] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
        {messages.length === 0 ? (
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
            <div key={message.id}>
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
                          className="text-sm"
                          speed={20}
                          onComplete={() => {
                            const currentMessagesForSubject = allMessages[subject] || [];
                            const lastMessageInSubject = currentMessagesForSubject[currentMessagesForSubject.length - 1];
                            if (lastMessageInSubject && lastMessageInSubject.id === message.id && lastMessageInSubject.role === 'assistant') {
                              setLatestAIMessageIdForActions(message.id);
                            }
                          }}
                        />
                      )}
                      {message.role === 'assistant' && message.cost && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">{message.model}</span>
                          <span className="text-xs text-gray-500">¥{message.cost.toFixed(4)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              {message.role === 'assistant' && message.id === latestAIMessageIdForActions && (
                <div className="mt-2 flex flex-wrap gap-2 justify-start pl-11 pb-2">
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction('もっとわかりやすく教えてください')} className="text-xs">
                    <Brain className="mr-1 h-3 w-3" /> もっとわかりやすく
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction('具体例をあげてください')} className="text-xs">
                    <Sparkles className="mr-1 h-3 w-3" /> 具体例を教えて
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleUnderstood} className="text-xs">
                    <ThumbsUp className="mr-1 h-3 w-3" /> 完全に理解した！
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
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
                if (e.target.value.trim() !== '') { // Clear actions only if user types something meaningful
                  setLatestAIMessageIdForActions(null);
                }
              }}
              placeholder={`${subjectName}について質問してください...`}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim() || selectedImage) { // Ensure there's content to submit
                    handleSubmit(e as any); // Pass event, explicitText is not needed here
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
