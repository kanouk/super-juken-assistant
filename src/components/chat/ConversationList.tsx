import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Edit2, Check, X, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  subject: string;
  user_id: string;
}

interface ConversationListProps {
  subject: string;
  subjectName: string;
  userId: string | undefined;
  onSelectConversation: (conversationId: string | null) => void;
  currentConversationId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  subject,
  subjectName,
  userId,
  onSelectConversation,
  currentConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId && subject) {
      fetchConversations();
    }
  }, [userId, subject]);

  const fetchConversations = async () => {
    if (!userId) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "会話履歴の読み込みに失敗しました: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: editingTitle.trim() }
            : conv
        )
      );
      
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
      // まず関連するメッセージを削除
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // 次に会話を削除
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      // ローカル状態を更新
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      toast({
        title: "削除完了",
        description: "会話が正常に削除されました。",
      });
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
    <Card className="h-full">
      <CardHeader className="pb-3 px-3 lg:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base lg:text-lg truncate">{subjectName}の履歴</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectConversation(null)}
            className="gap-1 lg:gap-2 flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新規チャット</span>
            <span className="sm:hidden">新規</span>
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            読み込み中...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm lg:text-base">まだ会話がありません</p>
            <p className="text-xs lg:text-sm">新規チャットを開始してください</p>
          </div>
        ) : (
          <ScrollArea className="h-64 lg:h-96">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group ${
                  currentConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <div className="flex items-center gap-1 lg:gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="text-sm h-7 lg:h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(conversation.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
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
                            handleSaveEdit(conversation.id);
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
                            handleCancelEdit();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 lg:gap-2">
                        <h3 className="font-medium text-sm truncate flex-1">
                          {conversation.title}
                        </h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(conversation);
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
                                handleDeleteConversation(conversation.id);
                              }
                            }}
                            disabled={deletingId === conversation.id}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(conversation.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;
