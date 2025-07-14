import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";

export default function AlertDetailsModal({ alert, onClose, onDelete, token }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!alert) return null;

  // Delete confirmation modal
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(6px)"}}>
        <div className="relative bg-[var(--color-surface)] bg-opacity-90 p-6 rounded-xl shadow-lg border border-[var(--color-border)] min-w-[320px] max-w-md w-full">
          <p className="mb-6 text-[var(--color-text-primary)] text-center font-semibold text-lg">
            Are you sure you want to delete this alert?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-5 py-2 bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await onDelete(alert);
                setShowDeleteConfirm(false);
                setDeleteSuccess(true);
              }}
              className="px-5 py-2 bg-[var(--color-danger)] text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Delete success modal
  if (deleteSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(6px)"}}>
        <div className="relative bg-[var(--color-surface)] bg-opacity-90 p-6 rounded-xl shadow-lg border border-[var(--color-border)] min-w-[320px] max-w-md w-full">
          <p className="mb-6 text-[var(--color-text-primary)] text-center font-semibold text-lg">
            Alert deleted successfully!
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => { setDeleteSuccess(false); onClose(); }}
              className="px-5 py-2 bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main details sheet (slide from right, solid, with blur background)
  return (
    <Sheet open={!!alert} onOpenChange={open => !open && onClose()}>
      {/* Blurred, semi-opaque overlay behind the sheet */}
      <div className="fixed inset-0 z-40" style={{background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(6px)"}} />
      {/* Solid, fully opaque sheet content */}
      <SheetContent side="right" className="max-w-md bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg px-8 py-6 text-[var(--color-text-primary)]" style={{backdropFilter: "blur(2px)"}}>
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-[var(--color-primary)] drop-shadow-sm">Alert Details</SheetTitle>
          <SheetDescription>Detailed information about this alert.</SheetDescription>
        </SheetHeader>
        <div className="mb-3 flex flex-col gap-2">
          <div>
            <span className="font-semibold text-[var(--color-text-primary)]">Monitor URL:</span> <span className="text-[var(--color-text-secondary)]">{alert.monitor_url}</span>
          </div>
          <div>
            <span className="font-semibold text-[var(--color-text-primary)]">Status:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${alert.status === 'DOWN' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{alert.status}</span>
          </div>
          <div>
            <span className="font-semibold text-[var(--color-text-primary)]">Reason:</span> <span className="text-[var(--color-text-secondary)]">{alert.reason}</span>
          </div>
          {alert.error_message && (
            <div>
              <span className="font-semibold text-[var(--color-text-primary)]">Error:</span> <span className="text-red-600">{alert.error_message}</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-[var(--color-text-primary)]">Triggered At:</span> <span className="text-[var(--color-text-secondary)]">{new Date(alert.triggered_at).toLocaleString()}</span>
          </div>
        </div>
        {alert.id && alert.monitor_id && (
          <button
            onClick={async () => {
              setDownloading(true);
              try {
                const res = await fetch(`http://localhost:5000/api/monitor/${alert.monitor_id}/alert/${alert.id}/pdf`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to download PDF");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `alert.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                window.alert("Failed to download PDF");
              } finally {
                setDownloading(false);
              }
            }}
            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-60"
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
        )}
        <SheetFooter>
          <div className="flex justify-center gap-4 mt-8">
            <SheetClose asChild>
              <button className="px-5 py-2 bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition font-medium">
                Close
              </button>
            </SheetClose>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2 bg-[var(--color-danger)] text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Delete
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
