"use client";

import { useState, useEffect } from "react";
import useAuthToken from "@/hooks/useAuthToken";
import { MonitorIcon } from "lucide-react";

export default function AlertsPage() {
  const { token, loading } = useAuthToken();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || loading) return;
    async function fetchAlerts() {
      setIsLoading(true);
      const res = await fetch("http://localhost:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlerts(data.alerts || []);
      setIsLoading(false);
    }
    fetchAlerts();
  }, [token, loading]);

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <MonitorIcon className="w-8 h-8 text-[var(--color-primary)]" />
        Alerts
      </h1>
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-20 bg-[var(--color-surface)] bg-opacity-80 rounded-xl"
            />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-[var(--color-text-secondary)]">No alerts found.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="relative border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-90 p-5 rounded-lg shadow flex flex-col gap-2 transition hover:scale-[1.01] hover:shadow-xl"
            >
              <div className="flex items-center gap-2 text-lg font-mono">
                <span className="font-semibold text-[var(--color-primary)]">
                  {alert.monitor_url}
                </span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${alert.status === 'DOWN' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {alert.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm mt-1">
                <span>
                  {alert.reason}
                </span>
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
    </div>
  );
}
