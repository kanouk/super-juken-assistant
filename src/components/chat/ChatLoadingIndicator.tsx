
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from 'lucide-react';

const ChatLoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start pt-4">
      <div className="flex items-start space-x-3 max-w-2xl">
        {/* ロボットアイコン＋重ねたドット */}
        <div className="relative w-8 h-8 shrink-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-green-100 text-green-700 relative">
              <Bot className="h-4 w-4" />
              {/* ドットアニメーションをアイコン中央に絶対配置 */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="flex space-x-0.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </span>
            </AvatarFallback>
          </Avatar>
        </div>
        <Card className="bg-gray-100 border-gray-200 text-gray-900">
          <CardContent className="p-3">
            {/* 従来通りでも問題ないが、上で重ねてあるのでここは空 */}
            <span className="sr-only">考え中...</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;

