
import React from 'react';
import { Message } from './types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bot, Copy, Clock } from 'lucide-react';
import LaTeXRenderer from '../LaTeXRenderer';
import QuickActions from './QuickActions';
import { useProfile } from '@/hooks/useProfile';

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

  // AIメッセージが表示された時に即座にコールバックを呼び出す
  React.useEffect(() => {
    if (message.role === 'assistant' && message.db_id) {
      onTypewriterComplete(message.db_id);
    }
  }, [message.role, message.db_id, onTypewriterComplete]);

  if (message.role === 'user') {
    // ユーザーメッセージ：バブル表示（右寄せ、余白追加）
    return (
      <div className="w-full px-4 py-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end">
            <div className="flex items-start space-x-3 max-w-2xl flex-row-reverse space-x-reverse">
              <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-gray-100 shadow-sm">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="ユーザーアバター" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>

              <Card className="flex-1 min-w-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
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
                  <div className="prose prose-sm max-w-none prose-invert break-words">
                    <LaTeXRenderer content={message.content} className="text-sm leading-relaxed text-white" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AIメッセージ：画面全体に表示
  return (
    <div className="w-full group">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-green-100 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {message.image_url && (
                <div className="mb-4">
                  <img
                    src={message.image_url}
                    alt="Attached image"
                    className="max-w-full sm:max-w-md rounded-lg shadow-md border border-gray-200"
                  />
                </div>
              )}
              
              <div className="prose prose-lg max-w-none break-words prose-headings:text-gray-800 prose-headings:font-semibold prose-headings:mb-4 prose-headings:mt-6 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:mb-2 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-2">
                <LaTeXRenderer content={message.content} className="text-base leading-relaxed" />
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => onCopyToClipboard(message.content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        <span className="text-sm">コピー</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showQuickActions && (
        <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
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
