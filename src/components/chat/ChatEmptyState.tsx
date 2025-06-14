
import React from 'react';
import { Bot } from 'lucide-react';

interface ChatEmptyStateProps {
  subjectName: string;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ subjectName }) => {
  return (
    <div className="text-center py-12">
      <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {subjectName}の学習を始めましょう
      </h3>
      <p className="text-gray-600">
        質問や画像を送信して、AIと対話してみてください。
      </p>
    </div>
  );
};

export default ChatEmptyState;
