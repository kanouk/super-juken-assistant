
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Send, X, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LaTeXRenderer from "./LaTeXRenderer";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  cost?: number;
  model?: string;
  created_at: string;
}

interface ChatScreenProps {
  subject: string;
  subjectName: string;
  currentModel: string;
}

const ChatScreen = ({ subject, subjectName, currentModel }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() && !selectedImage) {
      return;
    }

    setIsLoading(true);

    try {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: inputText,
        image_url: imagePreview || undefined,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // TODO: Upload image to Supabase Storage if present
      // TODO: Call ask-ai Edge Function
      
      // Simulate AI response with LaTeX examples
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let responseContent = `${subjectName}に関するご質問ありがとうございます。${inputText ? `「${inputText}」について` : '画像について'}詳しく説明いたします。\n\nこちらは模擬応答です。`;
      
      // Add LaTeX examples for math and science subjects
      if (subject === 'math' || subject === 'physics') {
        responseContent += `\n\n数式の例：\n$$f(x) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$\n\nインライン数式の例: $E = mc^2$ は有名な物理法則です。\n\n二次方程式の解の公式:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        cost: 0.02,
        model: currentModel,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Clear input
      setInputText('');
      removeImage();

    } catch (error) {
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <Avatar className="w-8 h-8">
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
                    : 'bg-white border-gray-200'
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
                      <LaTeXRenderer 
                        content={message.content} 
                        className="text-sm text-gray-900"
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
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-green-100 text-green-700">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-white border-gray-200">
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
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`${subjectName}について質問してください...`}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
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
