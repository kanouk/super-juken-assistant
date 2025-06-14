
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from 'lucide-react';
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
    <div className="p-3 lg:p-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={inputText}
            onChange={handleTextareaChange}
            placeholder="質問してください..."
            className="min-h-[60px] max-h-32 resize-none text-sm lg:text-base"
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col space-y-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || (!inputText.trim() && selectedImages.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 p-2"
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
  );
};

export default MessageInput;
