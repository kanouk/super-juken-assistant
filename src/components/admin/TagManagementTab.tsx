
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTagManagement } from "@/hooks/useTagManagement";
import { TagCreateForm } from "./TagCreateForm";
import { TagEditForm } from "./TagEditForm";
import { TagList } from "./TagList";
import { Plus, Tags, ChevronDown, ChevronRight } from "lucide-react";
import type { TagMaster } from "@/types/tags";

export const TagManagementTab = () => {
  const { tags, isLoading, createTag, updateTag, deleteTag } = useTagManagement();
  const [editingTag, setEditingTag] = useState<TagMaster | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 教科別にタグをグループ化
  const tagsBySubject = tags.reduce((acc, tag) => {
    if (!acc[tag.subject]) {
      acc[tag.subject] = [];
    }
    acc[tag.subject].push(tag);
    return acc;
  }, {} as Record<string, TagMaster[]>);

  const handleCreateTag = async (tagData: { subject: string; major_category: string; minor_category: string }) => {
    await createTag(tagData);
    setShowCreateForm(false);
  };

  const handleUpdateTag = async (tagData: { id: string; major_category: string; minor_category: string }) => {
    await updateTag(tagData);
    setEditingTag(null);
  };

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('このタグを削除してもよろしいですか？')) {
      await deleteTag(tagId);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card className="shadow-lg border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center text-xl">
            <Tags className="h-6 w-6 mr-3 text-blue-600" />
            タグ管理
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              教科・分野別のタグを管理できます。登録されたタグは質問の自動分類に使用されます。
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規タグ作成
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* タグ作成フォーム */}
      {showCreateForm && (
        <TagCreateForm
          onSubmit={handleCreateTag}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* タグ編集フォーム */}
      {editingTag && (
        <TagEditForm
          tag={editingTag}
          onSubmit={handleUpdateTag}
          onCancel={() => setEditingTag(null)}
        />
      )}

      {/* タグ一覧 */}
      <div className="space-y-4">
        {Object.entries(tagsBySubject).map(([subject, subjectTags]) => (
          <TagList
            key={subject}
            subject={subject}
            tags={subjectTags}
            onEdit={setEditingTag}
            onDelete={handleDeleteTag}
          />
        ))}
      </div>

      {/* 統計情報 */}
      <Card className="shadow-lg border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg">統計情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Object.keys(tagsBySubject).length}</div>
              <div className="text-sm text-gray-600">教科数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tags.length}</div>
              <div className="text-sm text-gray-600">総タグ数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(tags.map(tag => tag.major_category)).size}
              </div>
              <div className="text-sm text-gray-600">大分類数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(tags.map(tag => tag.minor_category)).size}
              </div>
              <div className="text-sm text-gray-600">中分類数</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
