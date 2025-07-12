import useSWR from 'swr';
import useAuthToken from './useAuthToken';

const fetcher = ([url, token]) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => data.monitors || []);

export default function useMonitorsSWR() {
  const token = useAuthToken();

  const shouldFetch = typeof window !== "undefined" && !!token;

  const { data = [], isLoading, mutate } = useSWR(
    shouldFetch ? ['http://localhost:5000/api/monitor/all', token] : null,
    fetcher,
    { refreshInterval: 0 }
  );

  return { monitors: data, isLoading, mutate };
}
