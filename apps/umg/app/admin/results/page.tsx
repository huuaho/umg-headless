"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { getResults } from "@/lib/judging/api";
import type { ResultsRow } from "@/lib/judging/types";
import { currentCompetition } from "@/lib/competitions/current";

function divisionName(id: string): string {
  return currentCompetition.divisions.find((d) => d.id === id)?.name ?? id;
}

export default function AdminResultsPage() {
  const { user, token } = useAuth();
  const [rows, setRows] = useState<ResultsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await getResults(token);
      setRows(data.results);
    } catch {
      setError("Could not load results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.is_admin) load();
  }, [user?.is_admin, load]);

  // AdminGuard already ensures is_judge; results additionally require admin.
  if (user && !user.is_admin) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Aggregated results are visible to administrators only.
          </p>
          <Link href="/admin/" className="text-sm underline text-[#212223]">
            Back to submissions
          </Link>
        </div>
      </main>
    );
  }

  const divisions = Array.from(new Set(rows.map((r) => r.division)));

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-280 mx-auto px-6 py-10">
        <Link
          href="/admin/"
          className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
        >
          ← Back to submissions
        </Link>
        <h1 className="text-3xl font-bold text-[#212223] mt-4 mb-8">
          Results
        </h1>

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
          <p className="text-gray-500 py-12 text-center">Loading results...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 py-12 text-center">
            No submitted entries yet.
          </p>
        ) : (
          divisions.map((division) => (
            <div key={division} className="mb-12">
              <h2 className="text-xl font-bold text-[#212223] mb-4">
                {divisionName(division)}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-300 text-xs uppercase text-gray-500">
                      <th className="py-2 pr-4">Rank</th>
                      <th className="py-2 pr-4">Entry</th>
                      <th className="py-2 pr-4">Entrant</th>
                      <th className="py-2 pr-4">Avg total</th>
                      <th className="py-2 pr-4">Judges (final)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows
                      .filter((r) => r.division === division)
                      .map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-100 text-[#212223]"
                        >
                          <td className="py-2.5 pr-4 font-semibold">
                            {row.rank ?? "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <Link
                              href={`/admin/entry/?id=${row.id}`}
                              className="underline hover:no-underline"
                            >
                              #{row.id}
                            </Link>
                          </td>
                          <td className="py-2.5 pr-4">
                            {row.identity.first_name} {row.identity.last_name}
                          </td>
                          <td className="py-2.5 pr-4 font-semibold">
                            {row.average_total ?? "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            {row.judge_count} ({row.final_count} final)
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
