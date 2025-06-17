
import React, { useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Plus } from 'lucide-react';
import { ImageData } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  onSendMessage: (content: string, images?: ImageData[]) => void;
  isLoading: boolean;
  selectedImages: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  conversationUnderstood?: boolean;
  onNewChat?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  selectedImages,
  onImagesChange,
  conversationUnderstood = false,
  onNewChat,
}) => {
  const [inputText, setInputText] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conversationUnderstood) return;
    if (inputText.trim() || selectedImages.length > 0) {
      onSendMessage(inputText, selectedImages);
      setInputText('');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (conversationUnderstood) return;
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (conversationUnderstood) return;
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (inputText.trim() || selectedImages.length > 0) {
        onSendMessage(inputText, selectedImages);
        setInputText('');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (conversationUnderstood) return;
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImagesChange([...selectedImages, { url, alt: file.name }]);
    }
  };

  const InputArea = (
    <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
      {/* 選択された画像のプレビュー */}
      {selectedImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={image.alt}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => onImagesChange(selectedImages.filter((_, i) => i !== index))}
                className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Textarea
            value={inputText}
            onChange={handleTextareaChange}
            placeholder="質問してください... (Enterで送信、Shift+Enterで改行)"
            className="min-h-[70px] sm:min-h-[90px] max-h-32 sm:max-h-40 resize-none pr-12 border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none rounded-xl transition-all duration-150 text-sm sm:text-base"
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </form>
    </div>
  );

  if (conversationUnderstood) {
    return (
      <div className={`border-t border-green-200 bg-gradient-to-r from-green-50 to-blue-50 ${
        isMobile 
          ? 'fixed bottom-0 inset-x-0 z-50 w-full shadow-lg' 
          : 'p-4'
      }`}>
        <div className={`max-w-2xl mx-auto text-center space-y-3 ${isMobile ? 'p-4' : ''}`}>
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium text-sm sm:text-base">この質問は完全に理解しました！</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            別の質問がある場合は、新規チャットを開始してください。
          </p>
          {onNewChat && (
            <Button
              onClick={onNewChat}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              新規チャットを開始
            </Button>
          )}
        </div>
      </div>
    );
  }

  // モバイル: 下部固定＋横幅100%
  if (isMobile) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white w-full shadow-lg border-t border-gray-200">
        {InputArea}
      </div>
    );
  }

  return InputArea;
};

export default MessageInput;
