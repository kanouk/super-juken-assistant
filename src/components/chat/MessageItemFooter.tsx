
import React from 'react';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getModelDisplayName } from './getModelDisplayName';

interface MessageItemFooterProps {
  content: string;
  model?: string;
  cost?: number;
  onCopyToClipboard?: (text: string) => void;
}

const MessageItemFooter: React.FC<MessageItemFooterProps> = ({
  content,
  model,
  cost,
  onCopyToClipboard,
}) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(content);
      toast({
        title: "コピーしました",
        description: "回答がクリップボードにコピーされました",
        duration: 1500,
      });
    }
    if (onCopyToClipboard) onCopyToClipboard(content);
  };

  return (
    <div className="mt-6 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          {model && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border">
              {getModelDisplayName(model)}
            </span>
          )}
          {typeof cost !== 'undefined' && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
              ¥{Number(cost).toFixed(4)}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="回答をコピー"
          onClick={handleCopy}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-gray-500 hover:text-gray-700 shadow-sm hover:shadow-md"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageItemFooter;
