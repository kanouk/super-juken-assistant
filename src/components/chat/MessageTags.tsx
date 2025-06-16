
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import QuestionTags from './QuestionTags';

interface Tag {
  id: string;
  major_category: string;
  minor_category: string;
  subject: string;
}

interface MessageTagsProps {
  conversationId: string;
  className?: string;
}

const MessageTags: React.FC<MessageTagsProps> = ({ conversationId, className = "" }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('question_tags')
          .select(`
            tag_master (
              id,
              major_category,
              minor_category,
              subject
            )
          `)
          .eq('conversation_id', conversationId);

        if (error) {
          console.error('Error fetching message tags:', error);
          return;
        }

        const tagData = data?.map(item => item.tag_master).filter(Boolean) || [];
        setTags(tagData as Tag[]);
      } catch (error) {
        console.error('Failed to fetch message tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return <QuestionTags tags={tags} className={className} />;
};

export default MessageTags;
