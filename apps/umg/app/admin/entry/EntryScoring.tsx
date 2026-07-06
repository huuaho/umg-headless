"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { getSubmission, saveScore, criterionKey } from "@/lib/judging/api";
import type { SubmissionDetail } from "@/lib/judging/types";
import { currentCompetition } from "@/lib/competitions/current";
import { CompetitionApiError } from "@/lib/auth/api";

const SCORE_MIN = 1;
const SCORE_MAX = 10;

function divisionName(id: string): string {
  return currentCompetition.divisions.find((d) => d.id === id)?.name ?? id;
}

export function EntryScoring() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id") || 0);

  const [entry, setEntry] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const criteria = useMemo(
    () =>
      currentCompetition.evaluationCriteria.map((c) => ({
        ...c,
        key: criterionKey(c.name),
      })),
    []
  );

  const isFinal = entry?.my_score?.status === "final";

  const load = useCallback(async () => {
    if (!token || !id) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const detail = await getSubmission(token, id);
      setEntry(detail);
      if (detail.my_score) {
        setScores(detail.my_score.scores);
        setNotes(detail.my_score.notes);
      }
    } catch (err) {
      setLoadError(
        err instanceof CompetitionApiError && err.status === 404
          ? "Entry not found."
          : "Could not load the entry. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  const allScored = criteria.every((c) => scores[c.key] !== undefined);
  const total = criteria.reduce((sum, c) => sum + (scores[c.key] ?? 0), 0);

  const handleSave = async (status: "draft" | "final") => {
    if (!token || !entry) return;
    if (
      status === "final" &&
      !window.confirm(
        "Submit your final score? You will not be able to edit it afterwards."
      )
    ) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");
    try {
      const saved = await saveScore(token, entry.id, {
        scores,
        notes,
        status,
        criteria_version: currentCompetition.id,
      });
      setEntry({ ...entry, my_score: saved });
      setSaveMessage(
        status === "final" ? "Final score submitted." : "Draft saved."
      );
    } catch (err) {
      setSaveError(
        err instanceof CompetitionApiError
          ? err.message
          : "Could not save the score. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!id) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No entry selected.</p>
          <Link href="/admin/" className="text-sm underline text-[#212223]">
            Back to submissions
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading entry...</p>
      </main>
    );
  }

  if (loadError || !entry) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError || "Entry not found."}</p>
          <Link href="/admin/" className="text-sm underline text-[#212223]">
            Back to submissions
          </Link>
        </div>
      </main>
    );
  }

  const judgingNote =
    currentCompetition.divisionJudgingNotes[entry.division] ?? "";

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-280 mx-auto px-6 py-10">
        <Link
          href="/admin/"
          className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
        >
          ← Back to submissions
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-bold text-[#212223]">
            Entry #{entry.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {divisionName(entry.division)}
            {entry.identity
              ? ` · ${entry.identity.first_name} ${entry.identity.last_name}`
              : ""}
            {entry.submitted_at ? ` · submitted ${entry.submitted_at}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: the work */}
          <div className="lg:col-span-3 space-y-10">
            {entry.photos.map((photo, i) => (
              <figure key={i}>
                <img
                  src={photo.url}
                  alt={photo.title || `Photo ${i + 1}`}
                  className="w-full border border-gray-200"
                />
                <figcaption className="mt-3">
                  {photo.title && (
                    <p className="font-semibold text-[#212223]">
                      {photo.title}
                    </p>
                  )}
                  {photo.description && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                      {photo.description}
                    </p>
                  )}
                </figcaption>
              </figure>
            ))}

            {entry.biography && (
              <div>
                <h2 className="text-lg font-bold text-[#212223] mb-2">
                  Biography
                </h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {entry.biography}
                </p>
              </div>
            )}

            {/* Identity-gated: absent under blind judging, admins only */}
            {entry.identity?.recommender && (
              <div>
                <h2 className="text-lg font-bold text-[#212223] mb-2">
                  Recommender
                </h2>
                <p className="text-sm text-gray-600">
                  {entry.identity.recommender}
                </p>
              </div>
            )}
          </div>

          {/* Right: the scoring form */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#212223] mb-1">
                {isFinal ? "Your final score" : "Score this entry"}
              </h2>
              {judgingNote && (
                <p className="text-xs text-gray-500 mb-5 italic">
                  {judgingNote}
                </p>
              )}

              <div className="space-y-5">
                {criteria.map((criterion) => (
                  <div key={criterion.key}>
                    <p className="text-sm font-medium text-[#212223]">
                      {criterion.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {criterion.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(
                        { length: SCORE_MAX - SCORE_MIN + 1 },
                        (_, i) => SCORE_MIN + i
                      ).map((value) => {
                        const selected = scores[criterion.key] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={isFinal || isSaving}
                            onClick={() =>
                              setScores((prev) => ({
                                ...prev,
                                [criterion.key]: value,
                              }))
                            }
                            className={`w-8 h-8 text-sm border transition-colors disabled:cursor-not-allowed ${
                              selected
                                ? "bg-[#212223] text-white border-[#212223]"
                                : "bg-white text-[#212223] border-gray-300 hover:border-gray-500 disabled:opacity-50"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-[#212223] mb-1"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    disabled={isFinal || isSaving}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 text-sm text-[#212223] focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-60"
                  />
                </div>

                <p className="text-sm text-[#212223]">
                  Total:{" "}
                  <span className="font-bold">
                    {total} / {criteria.length * SCORE_MAX}
                  </span>
                  {!allScored && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({criteria.filter((c) => scores[c.key] !== undefined).length}
                      /{criteria.length} criteria scored)
                    </span>
                  )}
                </p>

                {saveError && (
                  <p className="text-sm text-red-600">{saveError}</p>
                )}
                {saveMessage && (
                  <p className="text-sm text-green-700">{saveMessage}</p>
                )}

                {isFinal ? (
                  <p className="text-sm text-gray-500">
                    This score is final and locked. Contact an administrator if
                    it needs to change.
                  </p>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={isSaving || Object.keys(scores).length === 0}
                      onClick={() => handleSave("draft")}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-[#212223] border border-[#212223] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Saving..." : "Save draft"}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving || !allScored}
                      onClick={() => handleSave("final")}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit final
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
