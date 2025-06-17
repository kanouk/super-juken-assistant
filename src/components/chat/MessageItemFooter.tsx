
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
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 shadow-sm">
              {getModelDisplayName(model)}
            </span>
          )}
          {typeof cost !== 'undefined' && (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shadow-sm">
              ¥{Number(cost).toFixed(4)}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="回答をコピー"
          onClick={handleCopy}
          className="group flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default MessageItemFooter;
