
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface TagCreateFormProps {
  onSubmit: (tagData: { subject: string; major_category: string; minor_category: string }) => void;
  onCancel: () => void;
}

const SUBJECTS = [
  '国語', '数学', '英語', '物理', '化学', '生物', '地学',
  '世界史', '日本史', '地理', '情報'
];

export const TagCreateForm: React.FC<TagCreateFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    subject: '',
    major_category: '',
    minor_category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject && formData.major_category && formData.minor_category) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="shadow-lg border-2 border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-green-600" />
            新規タグ作成
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subject">教科 *</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="教科を選択" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="major_category">大分類 *</Label>
              <Input
                id="major_category"
                value={formData.major_category}
                onChange={(e) => setFormData(prev => ({ ...prev, major_category: e.target.value }))}
                placeholder="例：数学I・A"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="minor_category">中分類 *</Label>
              <Input
                id="minor_category"
                value={formData.minor_category}
                onChange={(e) => setFormData(prev => ({ ...prev, minor_category: e.target.value }))}
                placeholder="例：二次関数"
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
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.subject || !formData.major_category || !formData.minor_category}
            >
              作成
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
