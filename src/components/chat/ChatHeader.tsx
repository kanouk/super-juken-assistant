
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  subjectName: string;
  currentModel: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ subjectName, currentModel }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{subjectName}</h2>
          <p className="text-sm text-gray-600">現在のモデル: {currentModel}</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          AI チャット中
        </Badge>
      </div>
    </div>
  );
};

export default ChatHeader;
