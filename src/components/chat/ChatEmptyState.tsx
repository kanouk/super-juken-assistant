
import React from 'react';
import { Bot, MessageSquare, Sparkles, Brain } from 'lucide-react';

interface ChatEmptyStateProps {
  subjectName: string;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ subjectName }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {subjectName}の学習を始めましょう
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          質問や画像を送信して、AIと対話してみてください。<br />
          どんな些細なことでもお気軽にお聞きください。
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <MessageSquare className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 font-medium">テキストで質問</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Brain className="h-5 w-5 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-purple-800 font-medium">画像で質問</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatEmptyState;
