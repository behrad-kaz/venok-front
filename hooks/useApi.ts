// hooks/useApi.ts
import { useCallback, useState } from 'react';
import { api } from '@/services/api-client';

interface UseApiOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options?: UseApiOptions<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, execute };
}