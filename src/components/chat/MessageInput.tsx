
import React, { useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Paperclip } from 'lucide-react';
import { ImageData } from './types';

interface MessageInputProps {
  onSendMessage: (content: string, images?: ImageData[]) => void;
  isLoading: boolean;
  selectedImages: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  selectedImages,
  onImagesChange,
}) => {
  const [inputText, setInputText] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || selectedImages.length > 0) {
      onSendMessage(inputText, selectedImages);
      setInputText('');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (inputText.trim() || selectedImages.length > 0) {
        onSendMessage(inputText, selectedImages);
        setInputText('');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImagesChange([...selectedImages, { url, alt: file.name }]);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* 選択された画像のプレビュー */}
      {selectedImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={image.alt}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => onImagesChange(selectedImages.filter((_, i) => i !== index))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
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
            className="min-h-[60px] max-h-32 resize-none pr-12 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl"
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute right-3 bottom-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="h-5 w-5" />
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
};

export default MessageInput;
