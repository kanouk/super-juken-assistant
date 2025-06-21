
import { useState, useEffect, useMemo, useCallback } from 'react';
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

  // Stabilize year and month values to prevent infinite loops
  const currentYear = useMemo(() => year || new Date().getFullYear(), [year]);
  const currentMonth = useMemo(() => month || new Date().getMonth() + 1, [month]);

  const fetchCalendarData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Create immutable Date objects
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

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

      const activityMap = new Map<string, DailyActivity>();

      // Pre-populate all days of the month
      const daysInMonth = endDate.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth - 1, day);
        const dateStr = date.toISOString().split('T')[0];
        activityMap.set(dateStr, {
          date: dateStr,
          question_count: 0,
          understood_count: 0,
          has_activity: false
        });
      }

      // Process conversations
      conversations?.forEach(conv => {
        const convDate = conv.created_at.split('T')[0];
        const activity = activityMap.get(convDate);
        
        if (activity) {
          activity.has_activity = true;
          
          const userMessages = conv.messages?.filter(msg => msg.role === 'user') || [];
          activity.question_count += userMessages.length;
          
          if (conv.is_understood) {
            activity.understood_count += 1;
          }
        }
      });

      const sortedActivities = Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setDailyActivities(sortedActivities);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentYear, currentMonth]);

  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    // Create a new start date without mutating the original
    const startOfWeek = new Date(firstDay.getTime());
    startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());
    
    const weeks = [];
    let currentWeek = [];
    
    // Use a counter instead of mutating the date object
    const startTime = startOfWeek.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (let dayIndex = 0; dayIndex < 42; dayIndex++) { // 6 weeks max
      const currentTime = startTime + (dayIndex * oneDay);
      const currentDay = new Date(currentTime);
      
      if (dayIndex > 0 && currentDay > lastDay && currentWeek.length === 7) {
        break;
      }
      
      const dateStr = currentDay.toISOString().split('T')[0];
      const activity = dailyActivities.find(a => a.date === dateStr);
      const isCurrentMonth = currentDay.getMonth() === currentMonth - 1;
      const today = new Date();
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      currentWeek.push({
        date: new Date(currentDay),
        dateStr,
        activity: activity || null,
        isCurrentMonth,
        isToday
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
  }, [fetchCalendarData]);

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
