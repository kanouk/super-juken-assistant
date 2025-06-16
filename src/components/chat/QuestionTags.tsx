
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Tag {
  id: string;
  major_category: string;
  minor_category: string;
  subject: string;
}

interface QuestionTagsProps {
  tags: Tag[];
  className?: string;
}

const QuestionTags: React.FC<QuestionTagsProps> = ({ tags, className = "" }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      '国語': 'bg-red-100 text-red-800 border-red-200',
      '数学': 'bg-blue-100 text-blue-800 border-blue-200',
      '英語': 'bg-green-100 text-green-800 border-green-200',
      '物理': 'bg-purple-100 text-purple-800 border-purple-200',
      '化学': 'bg-pink-100 text-pink-800 border-pink-200',
      '生物': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      '地学': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      '世界史': 'bg-amber-100 text-amber-800 border-amber-200',
      '日本史': 'bg-orange-100 text-orange-800 border-orange-200',
      '地理': 'bg-teal-100 text-teal-800 border-teal-200',
      '情報': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className={`text-xs ${getSubjectColor(tag.subject)}`}
        >
          {tag.major_category} › {tag.minor_category}
        </Badge>
      ))}
    </div>
  );
};

export default QuestionTags;
