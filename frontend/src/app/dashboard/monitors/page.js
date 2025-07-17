"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { MonitorIcon } from "lucide-react";
import useAuthToken from "@/hooks/useAuthToken";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api-monitoring-app-production.up.railway.app'}/api`;

export default function MonitorsPage() {
  const { token, loading } = useAuthToken();

  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    monitorId: null,
  });
  const [editModal, setEditModal] = useState({ isOpen: false, monitor: null });
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);

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
    shouldFetch ? `${API_URL}/monitor/all` : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false }
  );

  // Ensure SWR cache is revalidated after updates
  const handleMonitorUpdate = async (updateFn) => {
    try {
      await updateFn();
      mutate(); // Refresh monitors from server
    } catch (err) {
      console.error("Error updating monitor:", err.message);
    }
  };

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/monitor/create`, {
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

  const handleEditMonitor = async () => {
    const { monitor } = editModal;
    setEditModal({ isOpen: false, monitor: null });

    try {
      const res = await fetch(
        `${API_URL}/monitor/${monitor.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: monitor.url,
            interval_minutes: monitor.interval_minutes,
            alert_threshold: monitor.alert_threshold,
            is_active: monitor.is_active,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || "Failed to update monitor");
      }

      mutate(); // Refresh the monitors list
      alert("Monitor updated successfully");
    } catch (err) {
      console.error("Error updating monitor:", err.message);
      alert("Failed to update monitor");
    }
  };

  const handleDeleteMonitor = async () => {
    const { monitorId } = deleteModal;
    setDeleteModal({ isOpen: false, monitorId: null });

    try {
      const res = await fetch(`${API_URL}/monitor/${monitorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || "Failed to delete monitor");
      }

      mutate(); // Refresh the monitors list
      setDeleteSuccessModal(true);
    } catch (err) {
      console.error("Error deleting monitor:", err.message);
      alert("Failed to delete monitor");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="relative z-10 w-full max-w-2xl lg:max-w-4xl mx-auto mt-6 lg:mt-12 px-4 lg:px-0">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 flex items-center gap-2 lg:gap-3">
          <MonitorIcon className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--color-primary)]" />
          Monitors
        </h1>
        <div className="space-y-3 lg:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-16 lg:h-20 bg-[var(--color-surface)] bg-opacity-80 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  // Adjust is_active filter logic
  const activeMonitors = monitors.filter((m) => m.is_active);

  return (
    <div className="relative z-10 w-full max-w-2xl lg:max-w-4xl mx-auto mt-6 lg:mt-12 px-4 lg:px-0">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 flex items-center gap-2 lg:gap-3">
        <MonitorIcon className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--color-primary)]" />
        Monitors
      </h1>

      {/* Add Monitor Form */}
      <form
        onSubmit={handleAddMonitor}
        className="mb-8 lg:mb-10 border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-80 rounded-xl p-4 lg:p-6 flex flex-col gap-3 lg:gap-4 shadow-lg"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">URL</label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] text-sm lg:text-base"
            placeholder="https://your-api.com/endpoint"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium">Check Interval (min)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)] text-sm lg:text-base"
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
              className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 py-2 rounded text-[var(--color-text-primary)] text-sm lg:text-base"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-[var(--color-primary)] hover:bg-blue-700 text-[var(--color-text-primary)] px-4 py-2 lg:py-3 rounded w-full mt-2 transition-colors font-semibold text-sm lg:text-base"
        >
          {creating ? "Adding..." : "Add Monitor"}
        </button>
      </form>

      {/* Active Monitors List */}
      {activeMonitors.length === 0 ? (
        <p className="text-[var(--color-text-secondary)]">
          No active monitors found.
        </p>
      ) : (
        <ul className="space-y-3 lg:space-y-4">
          {activeMonitors.map((monitor) => (
            <li
              key={monitor.id}
              className="relative border border-[var(--color-border)] bg-[var(--color-surface)] bg-opacity-90 p-4 lg:p-5 rounded-lg shadow flex flex-col gap-2 transition hover:scale-[1.01] hover:shadow-xl"
            >
              <span
                className={`absolute top-2 right-3 lg:right-4 text-xs lg:text-sm font-medium flex items-center gap-1 ${
                  monitor.isUp === true
                    ? "text-green-500"
                    : monitor.isUp === false
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
                style={{ transform: "translateY(50%)" }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    monitor.isUp === true
                      ? "bg-green-500"
                      : monitor.isUp === false
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
                {monitor.isUp === true
                  ? "Up"
                  : monitor.isUp === false
                  ? "Down"
                  : "Unknown"}
              </span>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 text-base lg:text-lg font-mono pr-16 lg:pr-20">
                <span className="font-semibold text-[var(--color-primary)] break-all text-sm lg:text-base">
                  {monitor.url}
                </span>
                <button
                  onClick={() => setEditModal({ isOpen: true, monitor })}
                  className="text-[var(--color-primary)] text-xs lg:text-sm border border-[var(--color-border)] px-2 py-1 rounded hover:bg-[var(--color-hover)] transition self-start lg:self-auto"
                >
                  Edit
                </button>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-xs lg:text-sm mt-1">
                <span className="text-[var(--color-success)]">🟢 Active</span>
                <span>Interval: {monitor.interval_minutes} min</span>
                <span>Threshold: {monitor.alert_threshold}</span>
                <button
                  onClick={() =>
                    setDeleteModal({ isOpen: true, monitorId: monitor.id })
                  }
                  className="lg:ml-auto text-[var(--color-danger)] hover:text-[var(--color-hover)] transition flex items-center justify-center h-full hover:scale-110 self-start lg:self-auto"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-[var(--color-bg)] bg-opacity-50 z-50">
          <div className="relative bg-[var(--color-surface)] p-6 rounded-xl shadow-lg border border-[var(--color-border)]">
            <p className="mb-4 text-[var(--color-text-primary)] text-center font-medium">
              Are you sure you want to delete this monitor?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteModal({ isOpen: false, monitorId: null })}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded hover:bg-[var(--color-hover)] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMonitor}
                className="px-4 py-2 bg-[var(--color-danger)] text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal after Deletion */}
      {deleteSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-[var(--color-bg)] bg-opacity-50 z-50">
          <div className="relative bg-[var(--color-surface)] p-6 rounded-xl shadow-lg border border-[var(--color-border)]">
            <p className="mb-4 text-[var(--color-text-primary)] text-center font-medium">
              Monitor deleted successfully!
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setDeleteSuccessModal(false)}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded hover:bg-[var(--color-hover)] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Monitor Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-[var(--color-bg)] bg-opacity-50 z-50 p-4">
          <div className="relative bg-[var(--color-surface)] p-4 lg:p-6 rounded-xl shadow-lg border border-[var(--color-border)] w-full max-w-md lg:max-w-lg">
            <p className="mb-4 text-[var(--color-text-primary)] text-center font-medium text-sm lg:text-base">
              Edit Monitor Details
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditMonitor();
              }}
              className="flex flex-col gap-4 lg:gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  URL
                </label>
                <input
                  type="url"
                  value={editModal.monitor.url}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      monitor: { ...prev.monitor, url: e.target.value },
                    }))
                  }
                  className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 lg:px-4 py-2 lg:py-3 rounded text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] text-sm lg:text-base"
                  placeholder="URL"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Interval (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={editModal.monitor.interval_minutes}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      monitor: { ...prev.monitor, interval_minutes: Number(e.target.value) },
                    }))
                  }
                  className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 lg:px-4 py-2 lg:py-3 rounded text-[var(--color-text-primary)] text-sm lg:text-base"
                  placeholder="Interval (minutes)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Alert Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={editModal.monitor.alert_threshold}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      monitor: { ...prev.monitor, alert_threshold: Number(e.target.value) },
                    }))
                  }
                  className="border border-[var(--color-border)] bg-[var(--color-bg)] bg-opacity-80 px-3 lg:px-4 py-2 lg:py-3 rounded text-[var(--color-text-primary)] text-sm lg:text-base"
                  placeholder="Alert Threshold"
                />
              </div>
              <div className="flex flex-col lg:flex-row justify-center gap-3 lg:gap-6 mt-4">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, monitor: null })}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded hover:bg-[var(--color-hover)] transition text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-[var(--color-primary)] text-white rounded hover:bg-blue-600 transition text-sm lg:text-base"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
