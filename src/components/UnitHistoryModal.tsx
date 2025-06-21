
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, ArrowRight } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { UnderstoodUnit } from '@/hooks/useUnderstoodUnits';
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface UnitHistoryModalProps {
  unit: UnderstoodUnit;
  isOpen: boolean;
  onClose: () => void;
}

interface ConversationHistory {
  id: string;
  title: string;
  understood_at: string;
  subject: string;
}

const UnitHistoryModal: React.FC<UnitHistoryModalProps> = ({
  unit,
  isOpen,
  onClose,
}) => {
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && unit) {
      fetchConversationHistory();
    }
  }, [isOpen, unit]);

  const fetchConversationHistory = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          understood_at,
          subject,
          question_tags!inner (
            tag_master!inner (
              major_category,
              minor_category,
              subject
            )
          )
        `)
        .eq('is_understood', true)
        .not('understood_at', 'is', null)
        .order('understood_at', { ascending: false });

      if (error) throw error;

      // Filter conversations that match this unit
      const filteredConversations = data?.filter((conv: any) =>
        conv.question_tags?.some((qt: any) =>
          qt.tag_master?.major_category === unit.major_category &&
          qt.tag_master?.minor_category === unit.minor_category &&
          qt.tag_master?.subject === unit.tag_subject
        )
      ) || [];

      setConversations(filteredConversations.map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        understood_at: conv.understood_at,
        subject: conv.subject,
      })));
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`text-xs ${getSubjectColor(unit.tag_subject)}`}
            >
              {unit.tag_subject}
            </Badge>
            <span>{unit.major_category} › {unit.minor_category}</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            この単元で理解した問題 ({unit.understanding_count}件)
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">該当する会話が見つかりませんでした</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">
                      {conversation.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(conversation.understood_at), {
                          addSuffix: true,
                          locale: ja,
                        })}に理解
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // This would navigate to the conversation
                      // For now, just close the modal
                      onClose();
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnitHistoryModal;
