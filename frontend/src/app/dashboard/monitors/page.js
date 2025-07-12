"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { MonitorIcon } from "lucide-react";
import useAuthToken from "@/hooks/useAuthToken";

export default function MonitorsPage() {
  const { token, loading } = useAuthToken();

  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [creating, setCreating] = useState(false);

  const fetcher = useCallback(
    async (url) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.monitors || [];
    },
    [token]
  );

  const shouldFetch = !!token && !loading;

  const { data: monitors = [], isLoading, mutate } = useSWR(
    shouldFetch ? "http://localhost:5000/api/monitor/all" : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false }
  );

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("http://localhost:5000/api/monitor/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          interval_minutes: interval,
          alert_threshold: threshold,
        }),
      });

      if (res.ok) {
        setUrl("");
        setInterval(5);
        setThreshold(3);
        mutate();
      }
    } catch (err) {
      console.error("Error creating monitor:", err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <MonitorIcon className="w-8 h-8 text-[var(--color-primary)]" />
        Monitors
      </h1>

      {/* Add Monitor Form */}
      <form
        onSubmit={handleAddMonitor}
        className="mb-10 border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-80 rounded-xl p-6 flex flex-col gap-4 shadow-lg"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">URL</label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
            placeholder="https://your-api.com/endpoint"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Check Interval (min)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Alert Threshold</label>
            <input
              type="number"
              min={1}
              max={10}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-[var(--color-primary)] hover:bg-blue-700 text-[var(--color-text-primary)] px-4 py-2 rounded w-full mt-2 transition-colors font-semibold"
        >
          {creating ? "Adding..." : "Add Monitor"}
        </button>
      </form>

      {/* Active Monitors List */}
      {loading || isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-20 bg-[var(--color-surface)] bg-opacity-80 rounded-xl"
            />
          ))}
        </div>
      ) : monitors.filter((m) => m.is_active).length === 0 ? (
        <p className="text-[var(--color-text-secondary)]">
          No active monitors found.
        </p>
      ) : (
        <ul className="space-y-4">
          {monitors
            .filter((m) => m.is_active)
            .map((monitor) => (
              <li
                key={monitor.id}
                className="border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-90 p-5 rounded-lg shadow flex flex-col gap-2 transition hover:scale-[1.01] hover:shadow-xl"
              >
                <div className="flex items-center gap-2 text-lg font-mono">
                  <span className="font-semibold text-[var(--color-primary)]">
                    {monitor.url}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm mt-1">
                  <span className="text-[var(--color-success)]">🟢 Active</span>
                  <span>Interval: {monitor.interval_minutes} min</span>
                  <span>Threshold: {monitor.alert_threshold}</span>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
