"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { listSubmissions } from "@/lib/judging/api";
import type { ScoreStatus, SubmissionSummary } from "@/lib/judging/types";
import { currentCompetition } from "@/lib/competitions/current";

const STATUS_LABELS: Record<ScoreStatus, string> = {
  unscored: "Not scored",
  draft: "In progress",
  final: "Final",
};

const STATUS_STYLES: Record<ScoreStatus, string> = {
  unscored: "bg-gray-100 text-gray-600",
  draft: "bg-amber-100 text-amber-800",
  final: "bg-green-100 text-green-800",
};

function divisionName(id: string): string {
  return currentCompetition.divisions.find((d) => d.id === id)?.name ?? id;
}

export default function AdminSubmissionsPage() {
  const { user, token, logout } = useAuth();
  const [entries, setEntries] = useState<SubmissionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [division, setDivision] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ScoreStatus>("");

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const list = await listSubmissions(token, {
        division: division || undefined,
      });
      setEntries(list.entries);
      setTotal(list.total);
    } catch {
      setError("Could not load submissions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, division]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = statusFilter
    ? entries.filter((e) => e.my_score_status === statusFilter)
    : entries;

  const scoredCount = entries.filter(
    (e) => e.my_score_status === "final"
  ).length;

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-280 mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#212223]">
              Judging Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Signed in as {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user?.is_admin && (
              <Link
                href="/admin/results/"
                className="text-sm font-medium text-[#212223] underline hover:no-underline"
              >
                Results
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-8">
          {total} submitted {total === 1 ? "entry" : "entries"} · you have
          finalized {scoredCount}
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm text-[#212223] focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="">All divisions</option>
            {currentCompetition.divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | ScoreStatus)}
            className="px-3 py-2 border border-gray-300 text-sm text-[#212223] focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="">All statuses</option>
            <option value="unscored">Not scored</option>
            <option value="draft">In progress</option>
            <option value="final">Final</option>
          </select>
        </div>

        {error && (
          <div className="mb-6">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              type="button"
              onClick={load}
              className="text-sm underline text-[#212223]"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500 py-12 text-center">
            Loading submissions...
          </p>
        ) : visible.length === 0 ? (
          <p className="text-gray-500 py-12 text-center">
            No entries match the current filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((entry) => (
              <Link
                key={entry.id}
                href={`/admin/entry/?id=${entry.id}`}
                className="block border border-gray-200 hover:border-gray-400 transition-colors"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {entry.photos[0] ? (
                    <img
                      src={entry.photos[0].url}
                      alt={entry.photos[0].title || `Entry #${entry.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#212223]">
                      Entry #{entry.id}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[entry.my_score_status]}`}
                    >
                      {STATUS_LABELS[entry.my_score_status]}
                      {entry.my_total !== null ? ` · ${entry.my_total}` : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {divisionName(entry.division)}
                    {entry.identity
                      ? ` · ${entry.identity.first_name} ${entry.identity.last_name}`
                      : ""}
                    {entry.photos.length > 1
                      ? ` · ${entry.photos.length} photos`
                      : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
