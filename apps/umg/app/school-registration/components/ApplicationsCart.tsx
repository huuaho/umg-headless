"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  createApplication,
  createCheckoutSession,
  deleteApplication,
  listApplications,
} from "@/lib/school/api";
import type { ApplicationSummary } from "@/lib/school/types";

const ENTRY_FEE = 50;

export function ApplicationsCart() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const checkoutParam = searchParams.get("checkout");

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const apps = await listApplications(token);
      setApplications(apps);
      setLoadFailed(false);
    } catch {
      setError("Could not load applications. Please try again.");
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unpaidSubmitted = applications.filter(
    (a) => a.status === "submitted" && a.payment_status !== "paid"
  );

  // Poll while anything submitted is still unpaid, same 15s pattern as the
  // individual flow (SubmissionForm.tsx), but polling the whole list
  // instead of a single account-level flag.
  useEffect(() => {
    if (unpaidSubmitted.length === 0) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      refresh();
    }, 15_000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [unpaidSubmitted.length, refresh]);

  const handleAddAnother = async () => {
    if (!token) return;
    setPendingId(-1);
    setError("");
    try {
      const id = await createApplication(token);
      router.push(`/school-registration/application?id=${id}`);
    } catch {
      setError("Could not create a new application. Please try again.");
      setPendingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm("Delete this application? This cannot be undone.")) {
      return;
    }
    setPendingId(id);
    setError("");
    try {
      await deleteApplication(token, id);
      await refresh();
    } catch {
      setError("Could not delete this application. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  const handlePayTotal = async () => {
    if (!token) return;
    setIsCheckingOut(true);
    setError("");
    try {
      const session = await createCheckoutSession(token);
      window.location.href = session.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setIsCheckingOut(false);
    }
  };

  const paidCount = applications.filter(
    (a) => a.payment_status === "paid"
  ).length;
  const total = applications.length * ENTRY_FEE;
  const owed = unpaidSubmitted.length * ENTRY_FEE;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {checkoutParam === "success" && (
        <div className="border border-green-200 bg-green-50 p-4 mb-6">
          <p className="text-sm text-green-800 font-medium">
            Payment received — updating statuses below. This can take a
            minute to reflect.
          </p>
        </div>
      )}
      {checkoutParam === "cancelled" && (
        <div className="border border-amber-200 bg-amber-50 p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium">
            Checkout was cancelled — nothing was charged. You can try again
            below whenever you&apos;re ready.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
      )}

      {loadFailed ? (
        <div className="text-center py-12 border border-dashed border-red-200">
          <p className="text-gray-500 mb-4">
            Couldn&apos;t load your applications.
          </p>
          <button
            type="button"
            onClick={() => refresh()}
            className="text-sm text-[#1565A0] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">
            No applications yet — add your first student.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 divide-y divide-gray-200 mb-6">
          {applications.map((app) => {
            const name =
              app.first_name || app.last_name
                ? `${app.first_name} ${app.last_name}`.trim()
                : "Untitled application";
            const isBusy = pendingId === app.id;

            return (
              <div
                key={app.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#212223] truncate">
                    {name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {app.division || "No division set"} ·{" "}
                    <span
                      className={
                        app.status === "submitted"
                          ? "text-green-700"
                          : "text-gray-500"
                      }
                    >
                      {app.status}
                    </span>{" "}
                    ·{" "}
                    <span
                      className={
                        app.payment_status === "paid"
                          ? "text-green-700"
                          : "text-amber-700"
                      }
                    >
                      {app.payment_status}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/school-registration/application?id=${app.id}`
                      )
                    }
                    className="text-sm text-[#1565A0] hover:underline"
                  >
                    {app.status === "submitted" ? "View" : "Edit"}
                  </button>
                  {app.status === "draft" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(app.id)}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {isBusy ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600 mb-6 px-1">
        <span>
          {applications.length} application
          {applications.length === 1 ? "" : "s"} · ${total} total
          {paidCount > 0 && ` (${paidCount} paid)`}
        </span>
      </div>

      {unpaidSubmitted.length > 0 && (
        <button
          type="button"
          onClick={handlePayTotal}
          disabled={isCheckingOut}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-[#1565A0] hover:bg-[#124f82] transition-colors disabled:opacity-50 mb-3"
        >
          {isCheckingOut
            ? "Starting checkout..."
            : `Pay $${owed} total (${unpaidSubmitted.length} student${unpaidSubmitted.length === 1 ? "" : "s"})`}
        </button>
      )}

      <button
        type="button"
        onClick={handleAddAnother}
        disabled={pendingId === -1}
        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
      >
        {pendingId === -1 ? "Creating..." : "Add another application"}
      </button>
    </div>
  );
}
