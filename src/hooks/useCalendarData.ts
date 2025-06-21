
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyActivity {
  date: string;
  question_count: number;
  understood_count: number;
  has_activity: boolean;
}

export const useCalendarData = (userId?: string, year?: number, month?: number) => {
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = year || new Date().getFullYear();
  const currentMonth = month || new Date().getMonth() + 1;

  const fetchCalendarData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Get start and end dates for the month
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch conversations and messages for the month
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          is_understood,
          messages (
            id,
            created_at,
            role
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr + 'T23:59:59.999Z');

      if (convError) {
        console.error('Error fetching calendar data:', convError);
        setError(convError.message);
        return;
      }

      // Process data by date
      const activityMap = new Map<string, DailyActivity>();

      // Initialize all dates in the month
      for (let day = 1; day <= endDate.getDate(); day++) {
        const date = new Date(currentYear, currentMonth - 1, day);
        const dateStr = date.toISOString().split('T')[0];
        activityMap.set(dateStr, {
          date: dateStr,
          question_count: 0,
          understood_count: 0,
          has_activity: false
        });
      }

      // Count activities by date
      conversations?.forEach(conv => {
        const convDate = conv.created_at.split('T')[0];
        const activity = activityMap.get(convDate);
        
        if (activity) {
          activity.has_activity = true;
          
          // Count user messages (questions)
          const userMessages = conv.messages?.filter(msg => msg.role === 'user') || [];
          activity.question_count += userMessages.length;
          
          // Count understood conversations
          if (conv.is_understood) {
            activity.understood_count += 1;
          }
        }
      });

      setDailyActivities(Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized calendar grid data
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startOfWeek = new Date(firstDay);
    startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());
    
    const weeks = [];
    let currentWeek = [];
    
    for (let day = new Date(startOfWeek); day <= lastDay || currentWeek.length < 7; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split('T')[0];
      const activity = dailyActivities.find(a => a.date === dateStr);
      const isCurrentMonth = day.getMonth() === currentMonth - 1;
      
      currentWeek.push({
        date: new Date(day),
        dateStr,
        activity: activity || null,
        isCurrentMonth,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return weeks;
  }, [dailyActivities, currentYear, currentMonth]);

  useEffect(() => {
    fetchCalendarData();
  }, [userId, currentYear, currentMonth]);

  return {
    dailyActivities,
    calendarData,
    isLoading,
    error,
    currentYear,
    currentMonth,
    refetch: fetchCalendarData
  };
};
