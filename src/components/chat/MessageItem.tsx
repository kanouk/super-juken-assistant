
import React from 'react';
import { Message } from './types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

const subjectColorMap: { [key: string]: string } = {
  math: 'from-blue-50 to-blue-100 border-blue-200',
  chemistry: 'from-purple-50 to-purple-100 border-purple-200',
  biology: 'from-green-50 to-green-100 border-green-200',
  english: 'from-indigo-50 to-indigo-100 border-indigo-200',
  japanese: 'from-rose-50 to-rose-100 border-rose-200',
  physics: 'from-orange-50 to-orange-100 border-orange-200',
  earth_science: 'from-cyan-50 to-cyan-100 border-cyan-200',
  world_history: 'from-yellow-50 to-yellow-100 border-yellow-200',
  japanese_history: 'from-pink-50 to-pink-100 border-pink-200',
  geography: 'from-teal-50 to-teal-100 border-teal-200',
  information: 'from-gray-50 to-gray-100 border-gray-200',
  other: 'from-slate-50 to-slate-100 border-slate-200',
};

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

  const gradient = subjectColorMap[subjectId] || 'from-slate-50 to-slate-100 border-slate-200';

  return (
    <div className="w-full group">
      <div
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
          message.role === 'assistant' ? 'animate-fade-in' : ''
        }`}
      >
        <div className={`flex items-start space-x-3 w-full max-w-4xl ${
          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <Avatar className="w-8 h-8 shrink-0 mt-1 ring-2 ring-gray-100 shadow-sm">
            {message.role === 'user' && profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="ユーザーアバター" />
            ) : null}
            <AvatarFallback className={
              message.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
            }>
              {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>

          <Card className={`flex-1 min-w-0 shadow-sm ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0'
              : `bg-gradient-to-br ${gradient} text-gray-900 border`
          }`}>
            <CardContent className="p-4">
              {message.image_url && (
                <div className="mb-3">
                  <img
                    src={message.image_url}
                    alt="Attached image"
                    className="max-w-full sm:max-w-xs rounded-lg shadow-md border border-gray-200"
                  />
                </div>
              )}
              {message.role === 'user' ? (
                <div className="prose prose-sm max-w-none prose-invert break-words">
                  <LaTeXRenderer content={message.content} className="text-sm leading-relaxed" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none break-words prose-headings:text-gray-800 prose-headings:font-semibold prose-strong:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm">
                  <LaTeXRenderer content={message.content} className="text-sm leading-relaxed" />
                </div>
              )}
              {message.role === 'assistant' && (message.cost || message.model) && (
                <div className="mt-4">
                  <Separator className="my-3 bg-gray-100" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="truncate font-medium">{message.model || 'N/A'}</span>
                      </div>
                      {message.cost && (
                        <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                          ¥{message.cost.toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => onCopyToClipboard(message.content)}
                      >
                        <Copy className="h-3 w-3 mr-1.5" />
                        <span className="hidden sm:inline text-xs">コピー</span>
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
        <div className="mt-3">
          <QuickActions
            onQuickAction={onQuickAction}
            onUnderstood={onUnderstood}
            isUnderstood={isUnderstood || message.is_understood}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
