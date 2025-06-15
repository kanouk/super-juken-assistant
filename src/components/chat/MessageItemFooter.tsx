
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

  // フッターは必ず表示。model/costがなければ非表示テキストなし/空欄
  return (
    <div
      className="
        flex items-center gap-4 
        justify-end
        mt-4
        pr-2
        z-20
        bg-white/95 backdrop-blur
        rounded-xl
        shadow-lg
        border border-gray-100
        w-fit
        ml-auto
        px-3 py-1
      "
      style={{ position: "static" }}
    >
      {model ? (
        <span className="text-xs text-gray-400 font-mono min-w-[90px] select-text">
          {getModelDisplayName(model)}
        </span>
      ) : (
        <span className="text-xs text-gray-200 font-mono min-w-[90px] select-text">&nbsp;</span>
      )}
      {typeof cost !== 'undefined' ? (
        <span className="text-xs text-gray-400 font-mono select-text">¥{Number(cost).toFixed(4)}</span>
      ) : (
        <span className="text-xs text-gray-200 font-mono select-text">&nbsp;</span>
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

