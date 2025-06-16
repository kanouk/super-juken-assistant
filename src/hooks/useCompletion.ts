
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompletionOptions {
  api: string;
  body: any;
}

export const useCompletion = () => {
  const getCompletion = useCallback(async (options: CompletionOptions) => {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Use the Supabase Edge Function with proper URL and headers
      const response = await fetch('/functions/v1/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(options.body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Transform response to match expected format
      return {
        success: true,
        data: {
          content: result.response || result.content,
          model: result.model,
          cost: result.cost,
        }
      };
    } catch (error) {
      console.error('Completion error:', error);
      return { success: false, error };
    }
  }, []);

  return { getCompletion };
};
