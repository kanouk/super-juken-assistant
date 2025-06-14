
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from 'lucide-react';

const ChatLoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start pt-4"> {/* Added pt-4 for spacing like other messages */}
      <div className="flex items-start space-x-3 max-w-2xl">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-green-100 text-green-700">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <Card className="bg-gray-100 border-gray-200 text-gray-900">
          <CardContent className="p-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;
