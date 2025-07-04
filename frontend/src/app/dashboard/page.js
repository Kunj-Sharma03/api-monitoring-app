'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [creating, setCreating] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [logs, setLogs] = useState([]);


  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;


  const fetchLogs = async (monitorId) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:5000/api/monitor/${monitorId}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLogs(data.logs);
    setSelectedMonitor(monitorId);
  } catch (err) {
    console.error('Error fetching logs:', err);
  }
};

  const fetchMonitors = async () => {
    if (!token) return router.push('/login');

    try {
      const res = await fetch('http://localhost:5000/api/monitor/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await res.json();
      setMonitors(data.monitors || []);
    } catch (err) {
      console.error('Failed to fetch monitors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};


  const createMonitor = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('http://localhost:5000/api/monitor/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          interval_minutes: interval,
          alert_threshold: threshold,
        }),
      });

      if (res.ok) {
        setUrl('');
        setInterval(5);
        setThreshold(3);
        fetchMonitors();
      }
    } catch (err) {
      console.error('Failed to create monitor:', err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  return (
  <div className="p-6 max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Your Monitors</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>

    {/* Create Monitor Form */}
    <form onSubmit={createMonitor} className="mb-6 space-y-4 border p-4 rounded bg-gray-50">
      <div>
        <label className="block text-sm font-medium">URL</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Check Interval (minutes)</label>
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Alert Threshold</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <button
        type="submit"
        disabled={creating}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {creating ? 'Creating...' : 'Add Monitor'}
      </button>
    </form>

    {/* Monitor List */}
    {loading ? (
      <p>Loading...</p>
    ) : monitors.length === 0 ? (
      <p>No monitors found.</p>
    ) : (
      <ul className="space-y-2">
        {monitors.map((monitor) => (
          <li key={monitor.id} className="border p-4 rounded shadow">
            <p><strong>URL:</strong> {monitor.url}</p>
            <p><strong>Status:</strong> {monitor.is_active ? 'Active' : 'Inactive'}</p>
            <p><strong>Check Interval:</strong> {monitor.interval_minutes} min</p>
            <p><strong>Alert Threshold:</strong> {monitor.alert_threshold}</p>

            <button
              onClick={() =>
                selectedMonitor === monitor.id
                  ? setSelectedMonitor(null)
                  : fetchLogs(monitor.id)
              }
              className="text-blue-600 mt-2 underline"
            >
              {selectedMonitor === monitor.id ? 'Hide Logs' : 'View Logs'}
            </button>

            {selectedMonitor === monitor.id && logs.length > 0 && (
              <div className="mt-2 text-sm text-gray-700">
                <h3 className="font-semibold mb-1">Recent Logs:</h3>
                <ul className="space-y-1">
                  {logs.map((log) => (
                    <li key={log.id} className="border p-2 rounded">
                      <p>
                        <strong>{log.timestamp}</strong>: {log.status} ({log.status_code}) —{' '}
                        {log.response_time}ms
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);
}
