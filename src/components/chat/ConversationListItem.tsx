
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, MessageSquare, Clock, Edit2, Check, X } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import QuestionTags from './QuestionTags';

export interface Conversation {
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
  isEditing: boolean;
  isDeleting: boolean;
  editingTitle: string;
  onStartEdit: (conversation: Conversation) => void;
  onSaveEdit: (conversationId: string) => void;
  onCancelEdit: () => void;
  onSetEditingTitle: (title: string) => void;
  onDelete: (conversationId: string) => void;
  onSelect: (conversationId: string) => void;
  formatDate: (dateString: string) => string;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isEditing,
  isDeleting,
  editingTitle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onSetEditingTitle,
  onDelete,
  onSelect,
  formatDate
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true);
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
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, [conversation.id]);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => !isEditing && onSelect(conversation.id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editingTitle}
                  onChange={(e) => onSetEditingTitle(e.target.value)}
                  className="text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveEdit(conversation.id);
                  }}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelEdit();
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {conversation.title}
                </h3>
                {conversation.is_understood && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0">
                    理解済み
                  </span>
                )}
              </>
            )}
          </div>
          {!isEditing && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(conversation);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 flex-shrink-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conversation.id);
                }}
                disabled={isDeleting}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formatDate(conversation.created_at)}</span>
        </div>

        {!isLoadingTags && tags.length > 0 && (
          <QuestionTags tags={tags} className="mt-2" />
        )}
        
        {isLoadingTags && (
          <div className="mt-2 flex space-x-1">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationListItem;
