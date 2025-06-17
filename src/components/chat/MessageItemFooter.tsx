
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
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          {model && (
            <span className="font-mono">
              {getModelDisplayName(model)}
            </span>
          )}
          {typeof cost !== 'undefined' && (
            <span className="font-mono">
              ¥{Number(cost).toFixed(4)}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="回答をコピー"
          onClick={handleCopy}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default MessageItemFooter;
