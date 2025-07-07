'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [monitors, setMonitors] = useState([]);
  const [filteredMonitors, setFilteredMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(null);
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [creating, setCreating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('url');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchMonitors = async () => {
    if (!token) return router.push('/login');

    try {
      const res = await fetch('http://localhost:5000/api/monitor/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await res.json();

      // If response is HTML, likely backend crashed
      if (typeof data !== 'object' || !data.monitors) {
        throw new Error('Invalid response');
      }

      setMonitors(data.monitors || []);
    } catch (err) {
      console.error('Failed to fetch monitors:', err.message);
    } finally {
      setLoading(false);
    }
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
      console.error('Failed to create monitor:', err.message);
    } finally {
      setCreating(false);
    }
  };

  const fetchLogs = async (monitorId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/monitor/${monitorId}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setAlerts([]);
      setActiveView({ monitorId, type: 'logs' });
    } catch (err) {
      console.error('Error fetching logs:', err.message);
    }
  };

  const fetchAlerts = async (monitorId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/monitor/${monitorId}/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlerts(data.alerts || []);
      setLogs([]);
      setActiveView({ monitorId, type: 'alerts' });
    } catch (err) {
      console.error('Error fetching alerts:', err.message);
    }
  };

  const downloadPDF = async (monitorId, alertId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/monitor/${monitorId}/alert/${alertId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('PDF download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alert-${alertId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  useEffect(() => {
    let result = [...monitors];

    if (statusFilter !== 'ALL') {
      result = result.filter((m) => String(m.is_active) === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'url') return a.url.localeCompare(b.url);
      if (sortBy === 'interval') return a.interval_minutes - b.interval_minutes;
      if (sortBy === 'threshold') return a.alert_threshold - b.alert_threshold;
      return 0;
    });

    setFilteredMonitors(result);
  }, [monitors, statusFilter, sortBy]);

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

      {/* Filter & Sort */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="ALL">All</option>
          <option value="true">🟢 Active</option>
          <option value="false">🔴 Inactive</option>
        </select>

        <label>Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="url">URL (A-Z)</option>
          <option value="interval">Interval</option>
          <option value="threshold">Threshold</option>
        </select>
      </div>

      {/* Monitor List */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredMonitors.length === 0 ? (
        <p>No monitors found.</p>
      ) : (
        <ul className="space-y-2">
          {filteredMonitors.map((monitor) => (
            <li key={monitor.id} className="border p-4 rounded shadow">
              <p><strong>URL:</strong> {monitor.url}</p>
              <p>
                <strong>Status:</strong>{' '}
                {monitor.is_active ? (
                  <span className="text-green-600">🟢 Active</span>
                ) : (
                  <span className="text-red-600">🔴 Inactive</span>
                )}
              </p>
              <p><strong>Check Interval:</strong> {monitor.interval_minutes} min</p>
              <p><strong>Alert Threshold:</strong> {monitor.alert_threshold}</p>

              <div className="flex gap-4 mt-2">
                <button
                  onClick={() =>
                    activeView?.monitorId === monitor.id && activeView?.type === 'logs'
                      ? setActiveView(null)
                      : fetchLogs(monitor.id)
                  }
                  className="text-blue-600 underline"
                >
                  {activeView?.monitorId === monitor.id && activeView?.type === 'logs'
                    ? 'Hide Logs'
                    : 'View Logs'}
                </button>

                <button
                  onClick={() =>
                    activeView?.monitorId === monitor.id && activeView?.type === 'alerts'
                      ? setActiveView(null)
                      : fetchAlerts(monitor.id)
                  }
                  className="text-red-600 underline"
                >
                  {activeView?.monitorId === monitor.id && activeView?.type === 'alerts'
                    ? 'Hide Alerts'
                    : 'View Alerts'}
                </button>
              </div>

              {/* Logs */}
              {activeView?.monitorId === monitor.id && activeView?.type === 'logs' && logs.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
                  <h3 className="font-semibold mb-1">Recent Logs:</h3>
                  <ul className="space-y-1">
                    {logs.map((log) => (
                      <li key={log.id} className="border p-2 rounded">
                        <p>
                          <strong>{log.timestamp}</strong>: {log.status} ({log.status_code}) — {log.response_time}ms
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alerts */}
              {activeView?.monitorId === monitor.id && activeView?.type === 'alerts' && (
                <div className="mt-2 text-sm text-red-700">
                  <h3 className="font-semibold mb-1">Recent Alerts:</h3>
                  {alerts.length > 0 ? (
                    <ul className="space-y-1">
                      {alerts.map((alert) => (
                        <li key={alert.id} className="border p-2 rounded bg-red-50">
                          <p>
                            <strong>{new Date(alert.triggered_at).toLocaleString()}</strong> — {alert.reason}
                          </p>
                          <button
                            onClick={() => downloadPDF(monitor.id, alert.id)}
                            className="text-xs text-blue-700 underline mt-1"
                          >
                            Download PDF
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-gray-500">No alerts found.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
