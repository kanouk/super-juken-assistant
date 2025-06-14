
import React from 'react';
import { Message } from './types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Bot, Copy } from 'lucide-react';
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
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onCopyToClipboard,
  onTypewriterComplete,
  showQuickActions,
  onQuickAction,
  onUnderstood,
}) => {
  const { profile } = useProfile();

  // AIメッセージが表示された時に即座にコールバックを呼び出す
  React.useEffect(() => {
    if (message.role === 'assistant' && message.db_id) {
      onTypewriterComplete(message.db_id);
    }
  }, [message.role, message.db_id, onTypewriterComplete]);

  return (
    <div key={message.id} data-message-id={message.db_id || message.id} className="px-3 lg:px-4">
      <div
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
          message.role === 'assistant' ? 'animate-fade-in' : ''
        }`}
      >
        <div className={`flex items-start space-x-2 lg:space-x-3 max-w-full sm:max-w-2xl ${
          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <Avatar className="w-7 h-7 lg:w-8 lg:h-8 shrink-0 mt-1">
            {message.role === 'user' && profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="ユーザーアバター" />
            ) : null}
            <AvatarFallback className={
              message.role === 'user'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }>
              {message.role === 'user' ? <User className="h-3 w-3 lg:h-4 lg:w-4" /> : <Bot className="h-3 w-3 lg:h-4 lg:w-4" />}
            </AvatarFallback>
          </Avatar>

          <Card className={`max-w-full ${
            message.role === 'user'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-100 border-gray-200 text-gray-900'
          }`}>
            <CardContent className="p-2 lg:p-3">
              {message.image_url && (
                <img
                  src={message.image_url}
                  alt="Attached image"
                  className="max-w-full sm:max-w-xs rounded-lg mb-2"
                />
              )}
              {message.role === 'user' ? (
                <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white">
                  <LaTeXRenderer content={message.content} className="text-sm" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700">
                  <LaTeXRenderer content={message.content} className="text-sm lg:text-base" />
                </div>
              )}
              {message.role === 'assistant' && (message.cost || message.model) && (
                <div className="mt-3">
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate">{message.model || 'N/A'}</span>
                      {message.cost && (
                        <span>¥{message.cost.toFixed(4)}</span>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-gray-500 hover:text-gray-700"
                        onClick={() => onCopyToClipboard(message.content)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">コピー</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {message.role === 'assistant' && showQuickActions && (
        <QuickActions
          onQuickAction={onQuickAction}
          onUnderstood={onUnderstood}
          isUnderstood={message.is_understood}
        />
      )}
    </div>
  );
};

export default MessageItem;
