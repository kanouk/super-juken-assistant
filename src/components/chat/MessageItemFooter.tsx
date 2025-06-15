
import React from 'react';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // いずれかデータがある場合のみ表示
  if (!model && cost === undefined) return null;

  return (
    <div
      className="
        absolute right-4 bottom-4
        flex items-center gap-4 
        z-20
        bg-white/95 backdrop-blur
        px-3 py-1
        rounded-xl
        shadow-lg
        border border-gray-100
      "
    >
      {model && (
        <span className="text-xs text-gray-400">{model}</span>
      )}
      {cost !== undefined && (
        <span className="text-xs text-gray-400">¥{Number(cost).toFixed(4)}</span>
      )}
      <button
        type="button"
        aria-label="回答をコピー"
        onClick={handleCopy}
        className="ml-4 p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all text-gray-400 hover:text-gray-600"
        tabIndex={0}
        style={{ fontSize: 0 }}
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MessageItemFooter;

