'use client';
/**
 * useFetch – SWR-powered data fetching hook.
 *
 * Usage:
 *   const { data, error, isLoading, mutate } = useFetch('/api/api/departments/get');
 *
 * - Automatic caching  (re-use cached data while revalidating in background)
 * - Auto-retry on error
 * - Call mutate() after a create/update/delete to refresh
 */
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((r) => r.data);

export default function useFetch(url, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      ...options,
    }
  );

  return { data, error, isLoading, isValidating, mutate };
}
