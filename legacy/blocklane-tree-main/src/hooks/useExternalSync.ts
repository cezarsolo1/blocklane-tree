import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useExternalSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerSync = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      // Call the sync edge function directly
      const { data: result, error: syncError } = await supabase.functions.invoke(
        'sync-to-external-api',
        {
          body: {
            operation: 'MANUAL_SYNC',
            table: 'tickets',
            data,
            timestamp: new Date().toISOString()
          }
        }
      );

      if (syncError) throw syncError;

      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test the external API connection
      const { data: result, error: testError } = await supabase.functions.invoke(
        'sync-to-external-api',
        {
          body: {
            operation: 'TEST',
            table: 'test',
            data: { message: 'Connection test from Supabase' },
            timestamp: new Date().toISOString()
          }
        }
      );

      if (testError) throw testError;

      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    triggerSync,
    testConnection,
    loading,
    error
  };
}