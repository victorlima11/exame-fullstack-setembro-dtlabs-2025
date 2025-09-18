import { useState, useCallback } from 'react';

interface UseAuthFetchOptions extends RequestInit {
  withAuth?: boolean;
}

interface AuthFetchResult {
  authFetch: <T = any>(url: string, options?: UseAuthFetchOptions) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAuthFetch(): AuthFetchResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authFetch = useCallback(async <T = any>(url: string, options: UseAuthFetchOptions = {}): Promise<T | null> => {
    const { withAuth = true, headers, ...restOptions } = options;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(headers || {}),
      };

      if (withAuth && token) {
        (requestHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers: requestHeaders,
        ...restOptions,
      });

      if (!response.ok) {
        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch {
        }
        throw {
          status: response.status,
          statusText: response.statusText,
          ...errorBody,
        };
      }

      if (response.status === 204) return null;

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (err: any) {
      const errorMessage = err?.error || (err instanceof Error ? err.message : "Error at fetching data");
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { authFetch, loading, error, clearError: () => setError(null) };
}
