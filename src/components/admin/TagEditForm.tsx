
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, X } from "lucide-react";
import type { TagMaster } from "@/types/tags";

interface TagEditFormProps {
  tag: TagMaster;
  onSubmit: (tagData: { id: string; major_category: string; minor_category: string }) => void;
  onCancel: () => void;
}

export const TagEditForm: React.FC<TagEditFormProps> = ({ tag, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    major_category: tag.major_category,
    minor_category: tag.minor_category,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.major_category && formData.minor_category) {
      onSubmit({
        id: tag.id,
        ...formData,
      });
    }
  };

  return (
    <Card className="shadow-lg border-2 border-yellow-100">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Edit className="h-5 w-5 mr-2 text-yellow-600" />
            タグ編集: {tag.subject}
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="major_category">大分類 *</Label>
              <Input
                id="major_category"
                value={formData.major_category}
                onChange={(e) => setFormData(prev => ({ ...prev, major_category: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="minor_category">中分類 *</Label>
              <Input
                id="minor_category"
                value={formData.minor_category}
                onChange={(e) => setFormData(prev => ({ ...prev, minor_category: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button 
              type="submit" 
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={!formData.major_category || !formData.minor_category}
            >
              更新
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
