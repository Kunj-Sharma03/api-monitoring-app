"use client";

import { useState, useEffect } from "react";
import useAuthToken from "@/hooks/useAuthToken";
import { MonitorIcon, Search, ChevronDown, ChevronUp, Filter } from "lucide-react";
import AlertDetailsModal from "./AlertDetailsModal";

export default function AlertsPage() {
  const { token, loading } = useAuthToken();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("triggered_at");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    if (!token || loading) return;
    async function fetchAlerts() {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/monitor/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("Failed to fetch alerts:", res.status, res.statusText);
          setAlerts([]);
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setAlerts([]);
      }
      setIsLoading(false);
    }
    fetchAlerts();
  }, [token, loading]);

  // Filter, search, and sort logic
  const filteredAlerts = alerts
    .filter(a =>
      (!filterStatus || a.status === filterStatus) &&
      (!search || a.monitor_url.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "triggered_at") {
        return sortDir === "desc"
          ? new Date(b.triggered_at) - new Date(a.triggered_at)
          : new Date(a.triggered_at) - new Date(b.triggered_at);
      } else if (sortBy === "status") {
        return sortDir === "desc"
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      } else if (sortBy === "monitor_url") {
        return sortDir === "desc"
          ? b.monitor_url.localeCompare(a.monitor_url)
          : a.monitor_url.localeCompare(b.monitor_url);
      }
      return 0;
    });

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <MonitorIcon className="w-8 h-8 text-[var(--color-primary)]" />
        Alerts
      </h1>
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <div className="flex items-center gap-2 bg-[var(--color-surface)] rounded px-2 py-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm px-1"
            aria-label="Search alerts"
          />
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-surface)] rounded px-2 py-1">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-transparent outline-none text-sm text-[var(--color-text-primary)] appearance-none focus:ring-2 focus:ring-[var(--color-primary)] border border-[var(--color-border)] rounded"
            aria-label="Filter by status"
            style={{ background: 'rgba(30,41,59,0.7)' }}
          >
            <option value="" className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]">All Statuses</option>
            <option value="UP" className="bg-[var(--color-surface)] text-green-600">UP</option>
            <option value="DOWN" className="bg-[var(--color-surface)] text-red-600">DOWN</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-surface)] rounded px-2 py-1">
          <span className="text-xs text-[var(--color-text-secondary)]">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-transparent outline-none text-sm text-[var(--color-text-primary)] appearance-none focus:ring-2 focus:ring-[var(--color-primary)] border border-[var(--color-border)] rounded"
            aria-label="Sort by"
            style={{ background: 'rgba(30,41,59,0.7)' }}
          >
            <option value="triggered_at" className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]">Date</option>
            <option value="status" className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]">Status</option>
            <option value="monitor_url" className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]">Monitor</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
            className="ml-1"
            aria-label="Toggle sort direction"
          >
            {sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {/* Alerts List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-20 bg-[var(--color-surface)] bg-opacity-80 rounded-xl"
            />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <p className="text-[var(--color-text-secondary)]">No alerts found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredAlerts.map((alert) => (
            <li
              key={alert.id}
              className="relative border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-90 p-5 rounded-lg shadow flex flex-col gap-2 transition hover:scale-[1.01] hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedAlert(alert)}
              tabIndex={0}
              aria-label={`View details for alert on ${alert.monitor_url}`}
            >
              <div className="flex items-center gap-2 text-lg font-mono">
                <span className="font-semibold text-[var(--color-primary)]">
                  {alert.monitor_url}
                </span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${alert.status === 'DOWN' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {alert.status === 'DOWN' ? <MonitorIcon className="w-4 h-4 text-red-600" /> : <MonitorIcon className="w-4 h-4 text-green-600" />}
                  {alert.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm mt-1">
                <span>{alert.reason}</span>
                {alert.error_message && (
                  <span className="text-[var(--color-danger)]">{alert.error_message}</span>
                )}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                {new Date(alert.triggered_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Modal for alert details */}
      {selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          token={token}
          onDelete={async (alert) => {
            if (!alert || !alert.id) return;
            try {
              const res = await fetch(`http://localhost:5000/api/monitor/alert/${alert.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) throw new Error('Failed to delete alert');
              setAlerts(prev => prev.filter(a => a.id !== alert.id));
            } catch (err) {
              alert('Error deleting alert: ' + err.message);
            }
          }}
        />
      )}
    </div>
  );
}
