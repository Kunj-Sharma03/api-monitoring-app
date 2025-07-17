import useSWR from 'swr';
import useAuthToken from './useAuthToken';
import { useEffect } from 'react';

const fetcher = ([url, token]) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => data.monitors || []);

export default function useMonitorsSWR() {
  const { token } = useAuthToken();

  const shouldFetch = typeof window !== "undefined" && !!token;

  const { data = [], isLoading, mutate } = useSWR(
    shouldFetch ? [`${process.env.NEXT_PUBLIC_API_URL || 'https://api-monitoring-app-production.up.railway.app'}/api/monitor/all`, token] : null,
    fetcher,
    { 
      refreshInterval: 30000, // Refresh every 30 seconds for real-time status
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  useEffect(() => {
    if (token) {
      console.log('Token changed, clearing SWR cache');
      mutate(); // Clear SWR cache
    }
  }, [token, mutate]);

  return { monitors: data, isLoading, mutate };
}
