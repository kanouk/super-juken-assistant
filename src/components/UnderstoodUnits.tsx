
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useUnderstoodUnits, UnderstoodUnit } from "@/hooks/useUnderstoodUnits";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import UnitHistoryModal from './UnitHistoryModal';

const UnderstoodUnits: React.FC = () => {
  const { units, isLoading, error } = useUnderstoodUnits();
  const [selectedUnit, setSelectedUnit] = useState<UnderstoodUnit | null>(null);

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

  const getStarsForCount = (count: number) => {
    const starCount = Math.min(5, Math.max(1, count));
    return '★'.repeat(starCount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>最近理解した単元</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>最近理解した単元</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (units.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>最近理解した単元</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">まだ理解した単元がありません</p>
            <p className="text-sm text-gray-400">学習を始めて理解した内容を記録しましょう！</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>最近理解した単元</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {units.map((unit, index) => (
              <Button
                key={`${unit.major_category}-${unit.minor_category}-${unit.tag_subject}-${index}`}
                variant="outline"
                className="w-full p-4 h-auto flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedUnit(unit)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getSubjectColor(unit.tag_subject)}`}
                  >
                    {unit.tag_subject}
                  </Badge>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      {unit.major_category} › {unit.minor_category}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>{getStarsForCount(unit.understanding_count)} {unit.understanding_count}回理解</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(unit.latest_understood_at), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedUnit && (
        <UnitHistoryModal
          unit={selectedUnit}
          isOpen={!!selectedUnit}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </>
  );
};

export default UnderstoodUnits;
