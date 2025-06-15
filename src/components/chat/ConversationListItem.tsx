
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit2, Trash2, Check, X } from 'lucide-react';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  subject: string;
  user_id: string;
  is_understood?: boolean;
}

interface ConversationListItemProps {
  conversation: Conversation;
  isEditing: boolean;
  isDeleting: boolean;
  editingTitle: string;
  onStartEdit: (conversation: Conversation) => void;
  onSaveEdit: (conversationId: string) => void;
  onCancelEdit: () => void;
  onSetEditingTitle: (value: string) => void;
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
  formatDate,
}) => {
  return (
    <div
      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group w-full"
      onClick={() => onSelect(conversation.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1 lg:gap-2">
              <Input
                value={editingTitle}
                onChange={(e) => onSetEditingTitle(e.target.value)}
                className="text-sm h-7 lg:h-8"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSaveEdit(conversation.id);
                  } else if (e.key === 'Escape') {
                    onCancelEdit();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 lg:h-8 lg:w-8 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveEdit(conversation.id);
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 lg:h-8 lg:w-8 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelEdit();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 lg:gap-2">
              <h3 className="font-medium text-sm truncate flex-1">{conversation.title}</h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit(conversation);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('この会話を削除してもよろしいですか？')) {
                      onDelete(conversation.id);
                    }
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              {formatDate(conversation.created_at)}
            </p>
            {conversation.is_understood && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300 text-xs px-2 py-0.5 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                理解済み
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
