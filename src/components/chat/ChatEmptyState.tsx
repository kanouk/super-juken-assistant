
import React from 'react';

interface ChatEmptyStateProps {
  subjectName: string;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ subjectName }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-white">
      <div className="text-center max-w-md mx-auto">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {subjectName}の学習を始めましょう
        </h3>
        <p className="text-gray-600 mb-2 leading-relaxed">
          質問や画像を送信して、AIと対話してみてください。<br />
          どんな些細なことでもお気軽にお聞きください。
        </p>
      </div>
    </div>
  );
};

export default ChatEmptyState;

