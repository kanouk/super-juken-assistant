
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Edit2, Check, X } from 'lucide-react';
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{subjectName}の履歴</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectConversation(null)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            新規チャット
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
            <p>まだ会話がありません</p>
            <p className="text-sm">新規チャットを開始してください</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
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
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="text-sm h-8"
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
                          className="h-8 w-8 p-0"
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
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate flex-1">
                          {conversation.title}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(conversation);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
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
