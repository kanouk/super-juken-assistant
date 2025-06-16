
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaggingStatus {
  conversation_id: string;
  title: string;
  subject: string;
  created_at: string;
  user_email: string;
  tag_count: number;
  has_tags: boolean;
}

const TaggingStatusTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    tagged: 0,
    untagged: 0,
    percentage: 0
  });
  const [recentConversations, setRecentConversations] = useState<TaggingStatus[]>([]);
  const { toast } = useToast();

  const fetchTaggingStats = async () => {
    try {
      setIsLoading(true);

      // 全体統計を取得
      const { data: totalData, error: totalError } = await supabase
        .from('conversations')
        .select('id');

      if (totalError) throw totalError;

      // タグ付きの会話IDを取得
      const { data: taggedConversations, error: taggedError } = await supabase
        .from('question_tags')
        .select('conversation_id');

      if (taggedError) throw taggedError;

      const taggedIds = new Set(taggedConversations?.map(t => t.conversation_id) || []);

      const total = totalData?.length || 0;
      const tagged = taggedIds.size;
      const untagged = total - tagged;
      const percentage = total > 0 ? Math.round((tagged / total) * 100) : 0;

      setStats({ total, tagged, untagged, percentage });

      // 最近の会話とタグ付与状況を取得
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          subject,
          created_at,
          profiles!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (conversationError) throw conversationError;

      // 各会話のタグ数を取得
      const conversationIds = conversationData?.map(c => c.id) || [];
      const { data: tagCounts, error: tagCountError } = await supabase
        .from('question_tags')
        .select('conversation_id')
        .in('conversation_id', conversationIds);

      if (tagCountError) throw tagCountError;

      const tagCountMap = tagCounts?.reduce((acc, tag) => {
        acc[tag.conversation_id] = (acc[tag.conversation_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const statusData: TaggingStatus[] = conversationData?.map(conv => ({
        conversation_id: conv.id,
        title: conv.title,
        subject: conv.subject,
        created_at: conv.created_at,
        user_email: conv.profiles.email || 'unknown',
        tag_count: tagCountMap[conv.id] || 0,
        has_tags: tagCountMap[conv.id] > 0
      })) || [];

      setRecentConversations(statusData);

    } catch (error: any) {
      console.error('Error fetching tagging stats:', error);
      toast({
        title: "エラー",
        description: "タグ付与状況の取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaggingStats();
  }, []);

  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      '国語': 'bg-red-100 text-red-800',
      '数学': 'bg-blue-100 text-blue-800',
      '英語': 'bg-green-100 text-green-800',
      '物理': 'bg-purple-100 text-purple-800',
      '化学': 'bg-pink-100 text-pink-800',
      '生物': 'bg-emerald-100 text-emerald-800',
      '地学': 'bg-cyan-100 text-cyan-800',
      '世界史': 'bg-amber-100 text-amber-800',
      '日本史': 'bg-orange-100 text-orange-800',
      '地理': 'bg-teal-100 text-teal-800',
      '情報': 'bg-gray-100 text-gray-800',
    };
    return colorMap[subject] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">総質問数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.tagged}</div>
            <div className="text-sm text-gray-600">タグ付き</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.untagged}</div>
            <div className="text-sm text-gray-600">タグなし</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.percentage}%</div>
            <div className="text-sm text-gray-600">タグ付与率</div>
          </CardContent>
        </Card>
      </div>

      {/* 最近の質問一覧 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>最近の質問とタグ付与状況</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTaggingStats}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentConversations.map((conv) => (
              <div key={conv.conversation_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{conv.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Badge variant="outline" className={getSubjectColor(conv.subject)}>
                        {conv.subject}
                      </Badge>
                      <span>{conv.user_email}</span>
                      <span>•</span>
                      <span>{new Date(conv.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {conv.has_tags ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {conv.tag_count}個のタグ
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        タグなし
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaggingStatusTab;
