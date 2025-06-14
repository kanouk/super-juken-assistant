
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>) => void;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  subjectName: string;
  hasSelectedImage: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  onInputChange,
  onSubmit,
  onImageSelect,
  isLoading,
  subjectName,
  hasSelectedImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (inputText.trim() || hasSelectedImage) {
        onSubmit(e as any);
      }
    }
  };

  return (
    <div className="p-3 lg:p-4 bg-white border-t border-gray-200">
      <form onSubmit={onSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={inputText}
            onChange={handleTextareaChange}
            placeholder={`${subjectName}について質問してください...`}
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
            disabled={isLoading || (!inputText.trim() && !hasSelectedImage)}
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
        onChange={onImageSelect}
        className="hidden"
      />
    </div>
  );
};

export default MessageInput;
