
import { useCallback } from 'react';

interface CompletionOptions {
  api: string;
  body: any;
}

export const useCompletion = () => {
  const getCompletion = useCallback(async (options: CompletionOptions) => {
    try {
      // Use the correct Supabase Edge Function endpoint
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options.body),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Completion error:', error);
      return { success: false, error };
    }
  }, []);

  return { getCompletion };
};
