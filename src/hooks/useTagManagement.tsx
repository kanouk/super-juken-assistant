
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TagMaster, CreateTagRequest, UpdateTagRequest } from '@/types/tags';

export const useTagManagement = () => {
  const [tags, setTags] = useState<TagMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tag_master')
        .select('*')
        .order('subject', { ascending: true })
        .order('major_category', { ascending: true })
        .order('minor_category', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('タグの読み込みに失敗しました:', error);
      toast({
        title: "エラー",
        description: "タグの読み込みに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTag = async (tagData: CreateTagRequest) => {
    try {
      const { error } = await supabase
        .from('tag_master')
        .insert([tagData]);

      if (error) throw error;

      toast({
        title: "成功",
        description: "タグを作成しました。",
      });

      await loadTags();
    } catch (error) {
      console.error('タグの作成に失敗しました:', error);
      toast({
        title: "エラー",
        description: "タグの作成に失敗しました。既に同じタグが存在している可能性があります。",
        variant: "destructive",
      });
    }
  };

  const updateTag = async (tagData: UpdateTagRequest) => {
    try {
      const { error } = await supabase
        .from('tag_master')
        .update({
          major_category: tagData.major_category,
          minor_category: tagData.minor_category,
        })
        .eq('id', tagData.id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "タグを更新しました。",
      });

      await loadTags();
    } catch (error) {
      console.error('タグの更新に失敗しました:', error);
      toast({
        title: "エラー",
        description: "タグの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('tag_master')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast({
        title: "成功",
        description: "タグを削除しました。",
      });

      await loadTags();
    } catch (error) {
      console.error('タグの削除に失敗しました:', error);
      toast({
        title: "エラー",
        description: "タグの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  return {
    tags,
    isLoading,
    createTag,
    updateTag,
    deleteTag,
    reloadTags: loadTags,
  };
};
