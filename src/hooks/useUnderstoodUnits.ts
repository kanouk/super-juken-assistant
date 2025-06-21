
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UnderstoodUnit {
  major_category: string;
  minor_category: string;
  tag_subject: string;
  understanding_count: number;
  latest_understood_at: string;
  tag_id?: string;
}

export const useUnderstoodUnits = () => {
  const [units, setUnits] = useState<UnderstoodUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnderstoodUnits = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('conversations')
          .select(`
            understood_at,
            question_tags!inner (
              tag_master!inner (
                id,
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

        // Group by tag and calculate counts
        const unitMap = new Map<string, UnderstoodUnit>();
        
        data?.forEach((conversation) => {
          conversation.question_tags?.forEach((questionTag: any) => {
            const tag = questionTag.tag_master;
            if (!tag) return;

            const key = `${tag.major_category}-${tag.minor_category}-${tag.subject}`;
            const existing = unitMap.get(key);
            
            if (existing) {
              existing.understanding_count += 1;
              if (new Date(conversation.understood_at) > new Date(existing.latest_understood_at)) {
                existing.latest_understood_at = conversation.understood_at;
              }
            } else {
              unitMap.set(key, {
                major_category: tag.major_category,
                minor_category: tag.minor_category,
                tag_subject: tag.subject,
                understanding_count: 1,
                latest_understood_at: conversation.understood_at,
                tag_id: tag.id,
              });
            }
          });
        });

        // Convert to array and sort by latest understanding date
        const sortedUnits = Array.from(unitMap.values())
          .sort((a, b) => new Date(b.latest_understood_at).getTime() - new Date(a.latest_understood_at).getTime())
          .slice(0, 20);

        setUnits(sortedUnits);
      } catch (err) {
        console.error('Failed to fetch understood units:', err);
        setError('理解した単元の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnderstoodUnits();
  }, []);

  return { units, isLoading, error, refetch: () => {} };
};
