
import React from 'react';
import { Message } from './types';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Bot, Copy } from 'lucide-react';
import TypewriterEffect from '../TypewriterEffect'; // Assuming TypewriterEffect is in ../
import QuickActions from './QuickActions';

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
  return (
    <div key={message.id}>
      <div
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
          message.role === 'assistant' ? 'animate-fade-in' : ''
        }`}
      >
        <div className={`flex items-start space-x-3 max-w-2xl ${
          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className={
              message.role === 'user'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }>
              {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>

          <Card className={`${
            message.role === 'user'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-100 border-gray-200 text-gray-900'
          }`}>
            <CardContent className="p-3">
              {message.image_url && (
                <img
                  src={message.image_url}
                  alt="Attached image" // Changed alt text
                  className="max-w-xs rounded-lg mb-2"
                />
              )}
              {message.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <TypewriterEffect
                  content={message.content}
                  className="text-base"
                  speed={20}
                  onComplete={() => onTypewriterComplete(message.db_id)}
                />
              )}
              {message.role === 'assistant' && (message.cost || message.model) && (
                <div className="mt-2 pt-2">
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{message.model || 'N/A'}</span>
                    {message.cost && (
                      <span className="text-xs text-gray-500">¥{message.cost.toFixed(4)}</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-gray-700"
                      onClick={() => onCopyToClipboard(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
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
