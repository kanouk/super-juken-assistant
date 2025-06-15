
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import ConversationListItem, { Conversation } from './ConversationListItem';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNewChat: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleSaveEdit = async (conversationId: string) => {
    if (!editingTitle.trim()) return;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: editingTitle.trim() })
        .eq('id', conversationId);

      if (error) throw error;

      setEditingId(null);
      setEditingTitle('');
      toast({
        title: "タイトルを更新しました",
        description: "会話のタイトルが正常に更新されました。",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "タイトルの更新に失敗しました: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setDeletingId(conversationId);
    try {
      onDeleteConversation(conversationId);
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "会話の削除に失敗しました: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ja
      });
    } catch {
      return '不明';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 px-3 lg:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base lg:text-lg truncate">会話履歴</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="gap-1 lg:gap-2 flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新規チャット</span>
            <span className="sm:hidden">新規</span>
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 flex-1 flex flex-col justify-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm lg:text-base">まだ会話がありません</p>
            <p className="text-xs lg:text-sm">新規チャットを開始してください</p>
          </div>
        ) : (
          // ここでScrollArea→divラップの二重構造をやめ、ScrollArea直下にリストを描画
          <ScrollArea className="flex-1 min-h-0 h-full w-full">
            <div className="flex flex-col w-full min-h-0">
              {conversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isEditing={editingId === conversation.id}
                  isDeleting={deletingId === conversation.id}
                  editingTitle={editingTitle}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onSetEditingTitle={setEditingTitle}
                  onDelete={handleDeleteConversation}
                  onSelect={onSelectConversation}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;

