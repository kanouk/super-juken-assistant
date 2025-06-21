
import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendarData } from '@/hooks/useCalendarData';

interface LearningCalendarProps {
  userId?: string;
  className?: string;
}

const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

const WEEKDAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

const LearningCalendar: React.FC<LearningCalendarProps> = memo(({
  userId,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { calendarData, isLoading, error } = useCalendarData(userId, year, month);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth(), 1);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getActivityLevel = (activity: any) => {
    if (!activity || !activity.has_activity) return 0;
    if (activity.question_count < 3) return 1;
    if (activity.question_count < 10) return 2;
    return 3;
  };

  const getActivityColor = (level: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-gray-100';
    
    switch (level) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-400';
      case 3: return 'bg-green-600';
      default: return 'bg-gray-200';
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-red-600">
          カレンダーデータの読み込みに失敗しました
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>学習カレンダー</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-lg font-semibold min-w-[80px] text-center">
              {year}年{MONTH_NAMES[month - 1]}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAY_NAMES.map(day => (
                <div key={day} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAY_NAMES.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const activityLevel = getActivityLevel(day.activity);
                  const hasUnderstood = day.activity?.understood_count > 0;
                  
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        "relative h-8 rounded text-xs flex items-center justify-center font-medium transition-colors",
                        getActivityColor(activityLevel, day.isCurrentMonth),
                        {
                          'text-gray-400': !day.isCurrentMonth,
                          'text-gray-800': day.isCurrentMonth && activityLevel === 0,
                          'text-gray-700': day.isCurrentMonth && activityLevel === 1,
                          'text-white': day.isCurrentMonth && activityLevel >= 2,
                          'ring-2 ring-blue-500': day.isToday,
                        }
                      )}
                      title={day.activity ? 
                        `${day.date.getDate()}日: ${day.activity.question_count}問質問, ${day.activity.understood_count}個理解` : 
                        `${day.date.getDate()}日: 学習なし`
                      }
                    >
                      {day.date.getDate()}
                      
                      {/* Streak indicator */}
                      {activityLevel > 0 && hasUnderstood && (
                        <Flame className="absolute -top-1 -right-1 h-3 w-3 text-orange-500" />
                      )}
                      
                      {/* Target achievement indicator */}
                      {day.activity?.understood_count > 0 && (
                        <Target className="absolute -bottom-1 -right-1 h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>学習なし</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>少し</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>普通</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>たくさん</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

LearningCalendar.displayName = 'LearningCalendar';

export default LearningCalendar;
