
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from 'lucide-react';

const ChatLoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start pt-4">
      <div className="flex items-start space-x-3 max-w-2xl">
        {/* ロボットアイコン＋中央ドット */}
        <div className="relative w-8 h-8 shrink-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-green-500 text-white relative">
              <Bot className="h-5 w-5" />
              {/* ドットアニメーションをアイコン中央に */}
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <span className="flex space-x-1">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "#4880ff", // 青
                      animationDelay: "0ms",
                    }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "#9777fa", // 紫
                      animationDelay: "160ms",
                    }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "#4fe389", // 緑
                      animationDelay: "320ms",
                    }}
                  ></span>
                </span>
              </span>
            </AvatarFallback>
          </Avatar>
        </div>
        <Card className="bg-gray-100 border-gray-200 text-gray-900">
          <CardContent className="p-3">
            {/* ドットは上で重ねるのでここは空 */}
            <span className="sr-only">考え中...</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;

