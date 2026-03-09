"use client";

import { Suspense } from "react";
import { currentCompetition } from "@/lib/competitions/current";
import { useAuth } from "@/lib/auth/AuthContext";
import { AuthForm } from "./components/AuthForm";
import { SubmissionForm } from "./components/SubmissionForm";

function PhotoSubmissionContent() {
  const competition = currentCompetition;
  const { user, isLoading, logout } = useAuth();

  const step: "auth" | "submission" = !user ? "auth" : "submission";

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="w-full bg-gradient-to-r from-[#7EC8E3] via-[#A8D5E8] to-[#C5B8D9] px-6 py-10 md:py-14">
        <div className="max-w-280 mx-auto flex justify-center">
          <h1 className="font-[family-name:var(--font-libre-franklin)] font-semibold uppercase leading-[0.95] inline-grid">
            <span className="block text-4xl md:text-5xl lg:text-6xl text-[#1565A0]">
              My Hometown
            </span>
            <span className="flex items-end justify-between mt-1 gap-2">
              <span className="text-4xl md:text-5xl lg:text-6xl text-white">
                My Lens
              </span>
              <span className="text-[8px] md:text-[10px] lg:text-base normal-case font-normal leading-tight text-right mb-2">
                <span className="text-[#1565A0]">International Youth</span>
                <br />
                <span className="text-white">Photography Competition</span>
              </span>
            </span>
          </h1>
        </div>
      </section>

      {/* Step indicator */}
      <section className="max-w-280 mx-auto px-6 pt-6 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Sign In", "Submit"].map((label, i) => {
            const stepIndex = step === "auth" ? 0 : 1;
            const isActive = i === stepIndex;
            const isCompleted = i < stepIndex;

            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={`w-8 h-px ${isCompleted ? "bg-[#212223]" : "bg-gray-300"}`}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      isActive
                        ? "bg-[#212223] text-white"
                        : isCompleted
                          ? "bg-[#212223] text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${isActive ? "text-[#212223]" : "text-gray-400"}`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-280 mx-auto px-6 pb-16">
        {step === "auth" && <AuthForm />}
        {step === "submission" && user && (
          <SubmissionForm
            user={{ email: user.email, name: user.name }}
            onLogout={logout}
          />
        )}
      </section>
    </main>
  );
}

export default function PhotoSubmissionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <PhotoSubmissionContent />
    </Suspense>
  );
}
