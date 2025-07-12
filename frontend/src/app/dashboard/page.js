'use client';


import React, { useState, useRef, useEffect, useMemo } from 'react';
import useMonitorsSWR from '@/hooks/useMonitorsSWR';
import useAuthToken from '@/hooks/useAuthToken';
import pLimit from '@/lib/pLimit';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Chart from '@/components/ui/Chart';
import SplitText from '@/components/ui/SplitText';
import { useRouter } from 'next/navigation';
import { MonitorIcon } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState(null);
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [creating, setCreating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('url');
  const [editingMonitor, setEditingMonitor] = useState(null); // holds monitor being edited
  const [editUrl, setEditUrl] = useState('');
  const [editInterval, setEditInterval] = useState(5);
  const [editThreshold, setEditThreshold] = useState(3);
  const [editActive, setEditActive] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token = useAuthToken();
  const { monitors, isLoading, mutate } = useMonitorsSWR();
  const [chartData, setChartData] = useState({ labels: [], uptime: [], incidents: [] });

  // Fetch chart data when monitors change
  // Advanced: Parallelize stats requests with concurrency limit, update chart as data arrives
  React.useEffect(() => {
    if (!token || !monitors.length) return;
    let cancelled = false;
    const limit = pLimit(4); // 4 concurrent requests
    const statsArr = new Array(monitors.length);
    setChartData({ labels: [], uptime: [], incidents: [] });

    async function fetchStats() {
      await Promise.all(
        monitors.map((monitor, i) =>
          limit(async () => {
            try {
              const statsRes = await fetch(`http://localhost:5000/api/monitor/${monitor.id}/stats`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!statsRes.ok) return;
              const stats = await statsRes.json();
              statsArr[i] = {
                label: monitor.url,
                uptime: Number(stats.uptimePercent),
                incidents: stats.totalAlerts,
              };
              // Update chart as each stat arrives
              if (!cancelled) {
                const filtered = statsArr.filter(Boolean);
                setChartData({
                  labels: filtered.map((s) => s.label),
                  uptime: filtered.map((s) => s.uptime),
                  incidents: filtered.map((s) => s.incidents),
                });
              }
            } catch {}
          })
        )
      );
    }
    fetchStats();
    return () => { cancelled = true; };
  }, [token, monitors]);

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
        mutate(); // revalidate SWR cache
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

  const updateMonitor = async (e) => {
  e.preventDefault();
  if (!editingMonitor) return;

  try {
    const res = await fetch(`http://localhost:5000/api/monitor/${editingMonitor.id}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        url: editUrl,
        interval_minutes: editInterval,
        alert_threshold: editThreshold,
        is_active: editActive,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Failed to update monitor: ${error.msg || error.errors?.[0]?.msg}`);
      return;
    }

    const updated = await res.json();

    mutate(); // Refresh monitors from server

    setEditingMonitor(null); // Close modal
  } catch (err) {
    console.error('Update failed:', err.message);
    alert('Something went wrong while updating.');
  }
};

const deleteMonitor = async (id) => {
  if (!confirm('Deleting this monitor will also remove all associated logs and alerts. Proceed?')) return;

  try {
    const res = await fetch(`http://localhost:5000/api/monitor/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert('Failed to delete monitor');
      return;
    }

    mutate(); // Refresh monitors from server
  } catch (err) {
    console.error('Delete failed:', err.message);
    alert('Something went wrong while deleting.');
  }
};



  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const filteredMonitors = useMemo(() => {
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
  return result;
}, [monitors, statusFilter, sortBy]);

  // Memoize SplitText animation props to prevent infinite re-renders
  const splitTextFrom = useMemo(() => ({ opacity: 0, y: 40 }), []);
  const splitTextTo = useMemo(() => ({ opacity: 1, y: 0 }), []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex">
      {/* Main content area, right of sidebar */}
      <main className="flex-1 px-8 py-10 bg-[var(--color-bg)] bg-opacity-80 min-h-screen">
        {/* Top row: greeting and stats */}

        <div className="relative flex flex-col items-center justify-center w-full min-h-[70vh]">
          {/* Logout button top right */}
          <button
            onClick={handleLogout}
            className="absolute right-8 top-8 bg-[var(--color-error)] text-[var(--color-text-primary)] px-4 py-2 rounded hover:bg-red-600 transition-colors text-base font-medium z-10"
          >
            Logout
          </button>
          <div className="flex flex-col items-center justify-center w-full h-full">
            <SplitText
              text="Hello, User!"
              className="text-4xl font-bold font-sans text-center mb-8"
              delay={60}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={splitTextFrom}
              to={splitTextTo}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
            <div className="flex flex-row gap-12 mt-2 w-full justify-center z-10">
              <div className="flex flex-col items-center gap-1 bg-[var(--color-surface)] bg-opacity-80 border border-[var(--color-border)] rounded-lg px-10 py-8 min-w-[180px] shadow-md">
                <MonitorIcon className="w-10 h-10 text-[var(--color-primary)] mb-2" />
                <span className="text-sm text-[var(--color-text-secondary)] font-sans">Total Monitors</span>
        <span className="text-3xl font-bold font-sans">{isLoading ? '...' : monitors.length}</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-[var(--color-surface)] bg-opacity-80 border border-[var(--color-border)] rounded-lg px-10 py-8 min-w-[180px] shadow-md">
                <span className="w-5 h-5 rounded-full bg-[var(--color-success)] inline-block mb-2" />
                <span className="text-sm text-[var(--color-text-secondary)] font-sans">Active</span>
                <span className="text-2xl font-semibold font-sans">{isLoading ? '...' : monitors.filter(m => m.is_active).length}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Chart placeholder with scroll reveal, revealed on scroll */}
        {/* Spacer to push chart below the fold for scroll reveal */}
        <div style={{ height: '18vh' }}></div>
        <div className="w-full flex flex-col items-center justify-center mt-8 mb-8">
          <ScrollReveal baseOpacity={0.05} enableBlur={true} baseRotation={2} blurStrength={8} containerClassName="w-full">
            <div
              className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl flex flex-col items-center justify-center text-[var(--color-text-secondary)] text-lg font-mono shadow-2xl w-full max-w-7xl mx-auto"
              style={{ background: 'linear-gradient(135deg, rgba(240,235,255,0.38) 0%, rgba(220,210,255,0.18) 100%)', minHeight: '60vh', height: '60vh', width: '100%' }}
            >
              {/* Custom legend with circles */}
              <div className="flex gap-8 items-center mt-8 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: 'rgba(200, 180, 255, 0.75)' }}></span>
                  <span className="text-base font-medium text-[var(--color-text-primary)]">Uptime (%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: 'rgba(240, 235, 255, 0.7)' }}></span>
                  <span className="text-base font-medium text-[var(--color-text-primary)]">Incidents</span>
                </div>
              </div>
              {/* Chart loading skeleton */}
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center min-h-[300px]">
                  <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                </div>
              ) : (
                <Chart
                  type="bar"
                  className="w-full h-full"
                  height={null}
                  data={{
                    labels: chartData.labels,
                    datasets: [
                      {
                        label: 'Uptime (%)',
                        data: chartData.uptime,
                        backgroundColor: 'rgba(200, 180, 255, 0.75)',
                        borderRadius: 18,
                        barPercentage: 0.15,
                        categoryPercentage: 0.5,
                      },
                      {
                        label: 'Incidents',
                        data: chartData.incidents,
                        backgroundColor: 'rgba(240, 235, 255, 0.7)',
                        borderRadius: 18,
                        barPercentage: 0.15,
                        categoryPercentage: 0.5,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(200,180,255,0.97)',
                        titleColor: '#232329',
                        bodyColor: '#232329',
                        borderColor: '#e5dbff',
                        borderWidth: 1.5,
                        titleFont: { family: 'Nunito Sans, Inter, sans-serif', size: 18 },
                        bodyFont: { family: 'Nunito Sans, Inter, sans-serif', size: 16 },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: '#bdaaff',
                          font: { family: 'Nunito Sans, Inter, sans-serif', size: 17 },
                          padding: 10,
                        },
                        grid: { color: 'rgba(200,180,255,0.08)' },
                      },
                      y: {
                        ticks: {
                          color: '#bdaaff',
                          font: { family: 'Nunito Sans, Inter, sans-serif', size: 17 },
                          padding: 10,
                        },
                        grid: { color: 'rgba(200,180,255,0.08)' },
                      },
                    },
                    layout: { padding: 40 },
                    borderRadius: 24,
                  }}
                />
              )}
            </div>
          </ScrollReveal>
        </div>
        {/* Removed dummy content to reduce unnecessary space after charts */}

        {/* Create Monitor Form */}
        <form onSubmit={createMonitor} className="mb-8 space-y-4 border border-[var(--color-border)] p-6 rounded-lg bg-[var(--color-surface)] bg-opacity-80 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Check Interval (minutes)</label>
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Alert Threshold</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-[var(--color-primary)] hover:bg-blue-700 text-[var(--color-text-primary)] px-4 py-2 rounded w-full mt-2 transition-colors"
          >
            {creating ? 'Creating...' : 'Add Monitor'}
          </button>
        </form>

        {/* Filter & Sort */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-80 text-[var(--color-text-primary)] px-2 py-1 rounded"
          >
            <option value="ALL">All</option>
            <option value="true">🟢 Active</option>
            <option value="false">🔴 Inactive</option>
          </select>

          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-80 text-[var(--color-text-primary)] px-2 py-1 rounded"
          >
            <option value="url">URL (A-Z)</option>
            <option value="interval">Interval</option>
            <option value="threshold">Threshold</option>
          </select>
        </div>

        {/* Monitor List */}
    {isLoading ? (
      <p>Loading...</p>
    ) : filteredMonitors.length === 0 ? (
      <p>No monitors found.</p>
    ) : (
      <ul className="space-y-2">
        {filteredMonitors.map((monitor) => (
          <li key={monitor.id} className="border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-80 p-4 rounded shadow">
            <p><strong>URL:</strong> {monitor.url}</p>
            <p>
              <strong>Status:</strong>{' '}
              {monitor.is_active ? (
                <span className="text-[var(--color-success)]">🟢 Active</span>
              ) : (
                <span className="text-[var(--color-error)]">🔴 Inactive</span>
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
                className="text-[var(--color-primary)] underline"
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
                className="text-[var(--color-error)] underline"
              >
                {activeView?.monitorId === monitor.id && activeView?.type === 'alerts'
                  ? 'Hide Alerts'
                  : 'View Alerts'}
              </button>

              <button
                onClick={() => {
                  setEditingMonitor(monitor);
                  setEditUrl(monitor.url);
                  setEditInterval(monitor.interval_minutes);
                  setEditThreshold(monitor.alert_threshold);
                  setEditActive(monitor.is_active);
                }}
                className="text-[var(--color-warning)] underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMonitor(monitor.id)}
                className="text-[var(--color-error)] underline"
            >
              Delete
            </button>

            </div>

            {/* Logs */}
            {activeView?.monitorId === monitor.id && activeView?.type === 'logs' && logs.length > 0 && (
              <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
                <h3 className="font-semibold mb-1">Recent Logs:</h3>
                <ul className="space-y-1">
                  {logs.map((log) => (
                    <li key={log.id} className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 p-2 rounded">
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
              <div className="mt-2 text-sm text-[var(--color-error)]">
                <h3 className="font-semibold mb-1">Recent Alerts:</h3>
                {alerts.length > 0 ? (
                  <ul className="space-y-1">
                    {alerts.map((alert) => (
                      <li key={alert.id} className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 p-2 rounded">
                        <p>
                          <strong>{new Date(alert.triggered_at).toLocaleString()}</strong> — {alert.reason}
                        </p>
                        <button
                          onClick={() => downloadPDF(monitor.id, alert.id)}
                          className="text-xs text-[var(--color-primary)] underline mt-1"
                        >
                          Download PDF
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-[var(--color-text-secondary)]">No alerts found.</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    )}

    {/* Edit Monitor Modal */}
    {editingMonitor && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--color-surface)] p-6 rounded shadow-lg max-w-md w-full border border-[var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4">Edit Monitor</h2>
          <form onSubmit={updateMonitor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">URL</label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Check Interval (minutes)</label>
              <input
                type="number"
                value={editInterval}
                onChange={(e) => setEditInterval(Number(e.target.value))}
                className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Alert Threshold</label>
              <input
                type="number"
                value={editThreshold}
                onChange={(e) => setEditThreshold(Number(e.target.value))}
                className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editActive}
                onChange={() => setEditActive((prev) => !prev)}
              />
              <label className="text-sm">Active</label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingMonitor(null)}
                className="px-4 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[var(--color-primary)] text-[var(--color-text-primary)] px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
        )}
      </main>
  </div>
);
}

