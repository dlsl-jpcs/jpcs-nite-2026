"use client";

import { useState } from "react";
import { useTableScores } from "@/lib/hooks/use-table-scores";
import { Loader2 } from "lucide-react";

export default function ScoringPage() {
  const { scores, loading, error } = useTableScores();

  // Global action state
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Pending deltas per table ID
  const [pendingDeltas, setPendingDeltas] = useState<Record<string, number>>({});

  const handleAdjustPending = (tableId: string, amount: number) => {
    setPendingDeltas((prev) => {
      const current = prev[tableId] || 0;
      const next = current + amount;
      if (next === 0) {
        const copy = { ...prev };
        delete copy[tableId];
        return copy;
      }
      return { ...prev, [tableId]: next };
    });
  };

  const handleCancelPending = (tableId: string) => {
    setPendingDeltas((prev) => {
      const copy = { ...prev };
      delete copy[tableId];
      return copy;
    });
  };

  const handleConfirmPending = async (tableId: string) => {
    const delta = pendingDeltas[tableId];
    if (!delta) return;

    setActionError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_id: tableId,
          delta,
        }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(msg);
      }
      // Clear pending on success
      handleCancelPending(tableId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Scoring</h2>
        {submitting && (
          <div className="flex items-center gap-2 text-sm text-gold">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {actionError && (
        <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          Error: {actionError}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-white/50">Loading scores…</p>
      ) : error ? (
        <p className="text-sm text-red-300">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto rounded border border-surface-3 bg-surface-1 p-6">
          <p className="mb-4 text-[10px] uppercase tracking-widest text-text-muted">
            Table Rankings
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3 text-left text-text-muted">
                <th className="pb-3 pr-4 font-normal">#</th>
                <th className="pb-3 pr-4 font-normal w-full">Table</th>
                <th className="pb-3 pr-8 text-right font-normal whitespace-nowrap">Score</th>
                <th className="pb-3 text-right font-normal whitespace-nowrap w-[240px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((t, i) => {
                const pending = pendingDeltas[t.id] || 0;
                return (
                  <tr
                    key={t.id}
                    className="border-b border-surface-3/50 transition-colors hover:bg-surface-2"
                  >
                    <td className="py-3 pr-4 text-white/50">{i + 1}</td>
                    <td className="py-3 pr-4 font-medium text-white/80">
                      {t.display_name}
                    </td>
                    <td className="py-3 pr-8 text-right font-mono text-lg font-semibold text-gold whitespace-nowrap">
                      <span className="relative">
                        {t.current_score}
                        {pending !== 0 && (
                          <span
                            className={`absolute left-full ml-2 text-sm ${
                              pending > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {pending > 0 ? "+" : ""}
                            {pending}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 text-right w-[240px]">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-2 min-w-[140px]">
                          {pending !== 0 && (
                            <>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleCancelPending(t.id)}
                                className="h-8 rounded px-3 text-white/50 transition-colors hover:bg-surface-3 hover:text-white disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleConfirmPending(t.id)}
                                className="h-8 rounded bg-surface-3 px-3 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                              >
                                Confirm
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 border-l border-surface-3 pl-4">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleAdjustPending(t.id, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-surface-3 bg-surface-2 text-white transition-colors hover:border-white/20 hover:bg-surface-3 disabled:opacity-50"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleAdjustPending(t.id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded bg-gold text-night transition-colors hover:bg-gold-soft disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


