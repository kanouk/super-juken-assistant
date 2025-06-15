import React from 'react';
import { Message } from './types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Clock } from 'lucide-react';
import LaTeXRenderer from '../LaTeXRenderer';
import QuickActions from './QuickActions';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface MessageItemProps {
  message: Message;
  onCopyToClipboard: (text: string) => void;
  onTypewriterComplete: (messageDbId?: string) => void;
  showQuickActions: boolean;
  onQuickAction: (prompt: string) => void;
  onUnderstood: () => void;
  subjectId?: string;
  isUnderstood?: boolean;
  disabled?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onCopyToClipboard,
  onTypewriterComplete,
  showQuickActions,
  onQuickAction,
  onUnderstood,
  subjectId = 'other',
  isUnderstood,
  disabled = false,
}) => {
  const { profile } = useProfile();
  const { toast } = useToast();

  React.useEffect(() => {
    if (message.role === 'assistant' && message.db_id) {
      onTypewriterComplete(message.db_id);
    }
  }, [message.role, message.db_id, onTypewriterComplete]);

  // クリップボードへコピー
  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(message.content);
      toast({
        title: "コピーしました",
        description: "回答がクリップボードにコピーされました",
        duration: 1500,
      });
    }
    if (onCopyToClipboard) onCopyToClipboard(message.content);
  };

  if (message.role === 'user') {
    return (
      <div className="w-full px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end">
            <div className="flex items-start space-x-3 max-w-2xl flex-row-reverse space-x-reverse">
              <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-gray-100 shadow-sm">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="ユーザーアバター" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {/* User icon省略 */}
                </AvatarFallback>
              </Avatar>
              <Card className="flex-1 min-w-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 border-0">
                <CardContent className="p-4">
                  {message.image_url && (
                    <div className="mb-3">
                      <img
                        src={message.image_url}
                        alt="Attached image"
                        className="max-w-full sm:max-w-xs rounded-lg shadow-md border border-white/20"
                      />
                    </div>
                  )}
                  {/* ユーザーは常に白文字でレンダリング */}
                  <LaTeXRenderer content={message.content} className="text-white" colorScheme="user" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AIメッセージ
  return (
    <div className="w-full group">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6 relative">
          <div className="flex items-start space-x-4">
            <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-green-100 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                {/* AI bot icon省略 */}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 relative">
              {message.image_url && (
                <div className="mb-4">
                  <img
                    src={message.image_url}
                    alt="Attached image"
                    className="max-w-full sm:max-w-md rounded-lg shadow-md border border-gray-200"
                  />
                </div>
              )}

              {/* AIメッセージは黒基調 */}
              <LaTeXRenderer content={message.content} colorScheme="assistant" />
              
              {/* コピー＆コスト・モデル表示 */}
              <div className="absolute right-2 bottom-2 flex items-center gap-2 mb-2">
                <button
                  type="button"
                  aria-label="回答をコピー"
                  onClick={handleCopy}
                  className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all text-gray-400 hover:text-gray-600"
                  tabIndex={0}
                  style={{ fontSize: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </button>
                {/* コストを薄く表示 */}
                {typeof message.cost === "number" && (
                  <span className="text-xs text-gray-400 ml-1">
                    ¥{message.cost.toFixed(4)}
                  </span>
                )}
                {/* コストとモデル表示（薄グレー） */}
                {(message.cost !== undefined || message.model) && (
                  <span className="text-xs text-gray-400 ml-1 select-none">
                    {message.model && (
                      <span>{message.model}</span>
                    )}
                    {message.cost !== undefined && (
                      <span className="ml-1">¥{Number(message.cost).toFixed(4)}</span>
                    )}
                  </span>
                )}
              </div>

              {(message.cost || message.model) && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{message.model || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {message.cost && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-700">
                          ¥{message.cost.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showQuickActions && (
        <div className="bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="ml-12">
              <QuickActions
                onQuickAction={onQuickAction}
                onUnderstood={onUnderstood}
                isUnderstood={isUnderstood || message.is_understood}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
