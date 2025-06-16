
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import QuestionTags from './QuestionTags';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  is_understood: boolean;
}

interface Tag {
  id: string;
  major_category: string;
  minor_category: string;
  subject: string;
}

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onSelect,
  onDelete
}) => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
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
          .eq('conversation_id', conversation.id);

        if (error) {
          console.error('Error fetching tags:', error);
          return;
        }

        const tagData = data?.map(item => item.tag_master).filter(Boolean) || [];
        setTags(tagData as Tag[]);
      } catch (error) {
        console.error('Failed to fetch conversation tags:', error);
      }
    };

    fetchTags();
  }, [conversation.id]);

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <h3 className="font-medium text-sm text-gray-900 truncate">
            {conversation.title}
          </h3>
          {conversation.is_understood && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0">
              理解済み
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <Clock className="h-3 w-3 mr-1" />
        <span>
          {formatDistanceToNow(new Date(conversation.created_at), {
            addSuffix: true,
            locale: ja
          })}
        </span>
      </div>

      <QuestionTags tags={tags} className="mt-2" />
    </div>
  );
};

export default ConversationListItem;
