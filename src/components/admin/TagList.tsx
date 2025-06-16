
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import type { TagMaster } from "@/types/tags";

interface TagListProps {
  subject: string;
  tags: TagMaster[];
  onEdit: (tag: TagMaster) => void;
  onDelete: (tagId: string) => void;
}

export const TagList: React.FC<TagListProps> = ({ subject, tags, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  // 大分類別にタグをグループ化
  const tagsByMajorCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.major_category]) {
      acc[tag.major_category] = [];
    }
    acc[tag.major_category].push(tag);
    return acc;
  }, {} as Record<string, TagMaster[]>);

  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      '国語': 'bg-red-100 border-red-300',
      '数学': 'bg-blue-100 border-blue-300',
      '英語': 'bg-green-100 border-green-300',
      '物理': 'bg-purple-100 border-purple-300',
      '化学': 'bg-pink-100 border-pink-300',
      '生物': 'bg-emerald-100 border-emerald-300',
      '地学': 'bg-cyan-100 border-cyan-300',
      '世界史': 'bg-amber-100 border-amber-300',
      '日本史': 'bg-orange-100 border-orange-300',
      '地理': 'bg-teal-100 border-teal-300',
      '情報': 'bg-gray-100 border-gray-300',
    };
    return colorMap[subject] || 'bg-gray-100 border-gray-300';
  };

  return (
    <Card className={`shadow-lg border-2 ${getSubjectColor(subject)}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 mr-2" />
                ) : (
                  <ChevronRight className="h-5 w-5 mr-2" />
                )}
                {subject}
                <Badge variant="secondary" className="ml-3">
                  {tags.length}個
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {Object.entries(tagsByMajorCategory).map(([majorCategory, categoryTags]) => (
                <div key={majorCategory} className="border rounded-lg p-4 bg-white/50">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    {majorCategory}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {categoryTags.length}個
                    </Badge>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categoryTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {tag.minor_category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subject} > {majorCategory}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(tag)}
                            className="h-8 w-8 p-0 hover:bg-yellow-100"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(tag.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
