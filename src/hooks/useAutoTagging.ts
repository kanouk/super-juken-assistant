
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAutoTagging = () => {
  const { toast } = useToast();

  const triggerAutoTagging = async (conversationId: string, questionContent: string, subject?: string) => {
    try {
      console.log('Triggering auto-tagging for conversation:', conversationId);
      
      const { data, error } = await supabase.functions.invoke('auto-tag-question', {
        body: {
          conversationId,
          questionContent,
          subject
        }
      });

      if (error) {
        console.error('Auto-tagging error:', error);
        toast({
          title: "タグ付けエラー",
          description: "質問の自動タグ付けに失敗しました。",
          variant: "destructive",
        });
        return false;
      }

      if (data?.success) {
        console.log('Auto-tagging successful:', data);
        if (data.tagsCount > 0) {
          toast({
            title: "自動タグ付け完了",
            description: `${data.tagsCount}個のタグが自動的に付与されました。`,
          });
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to trigger auto-tagging:', error);
      return false;
    }
  };

  return { triggerAutoTagging };
};
