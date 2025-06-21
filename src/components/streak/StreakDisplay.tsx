
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  isLoading?: boolean;
  className?: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  isLoading = false,
  className
}) => {
  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-gray-400';
    if (streak < 7) return 'text-orange-500';
    if (streak < 30) return 'text-orange-600';
    return 'text-red-500';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return '今日から学習を始めましょう！';
    if (streak === 1) return '素晴らしいスタート！';
    if (streak < 7) return `${streak}日連続！この調子で続けましょう！`;
    if (streak < 30) return `${streak}日連続達成！習慣化できています！`;
    return `${streak}日連続！驚異的な継続力です！`;
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-gradient-to-r from-orange-50 to-red-50 border-orange-200", className)}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gradient-to-r from-orange-50 to-red-50 border-orange-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-full bg-white shadow-sm", {
            "animate-pulse": currentStreak > 0
          })}>
            <Flame className={cn("h-6 w-6", getStreakColor(currentStreak))} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {currentStreak}
              </span>
              <span className="text-sm text-gray-600">日連続</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getStreakMessage(currentStreak)}
            </p>
          </div>

          {longestStreak > currentStreak && (
            <div className="text-right">
              <div className="flex items-center space-x-1 text-yellow-600">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">{longestStreak}</span>
              </div>
              <p className="text-xs text-gray-500">最長記録</p>
            </div>
          )}

          {currentStreak > 0 && (
            <div className="text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
