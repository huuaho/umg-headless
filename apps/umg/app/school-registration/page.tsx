"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
// Reused as-is per the school-registration stopgap plan — same passwordless
// login, no school-specific auth code. Worth relocating out of
// photo-submission/ into a shared location once the fast-follow build starts.
import { AuthForm } from "../photo-submission/components/AuthForm";
import { ApplicationsCart } from "./components/ApplicationsCart";

function SchoolRegistrationContent() {
  const { user, isLoading, logout } = useAuth();

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
          <h1 className="font-[family-name:var(--font-libre-franklin)] font-semibold uppercase leading-[0.95] text-center">
            <span className="block text-3xl md:text-4xl lg:text-5xl text-[#1565A0]">
              School Registration
            </span>
            <span className="block text-sm md:text-base normal-case font-normal text-white mt-2">
              Register multiple students on behalf of your school
            </span>
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-280 mx-auto px-6 py-12">
        {!user && <AuthForm />}
        {user && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto flex items-center justify-between text-sm">
              <p className="text-[#212223]">
                Signed in as{" "}
                <span className="font-semibold">{user.email}</span>
              </p>
              <button
                type="button"
                onClick={logout}
                className="text-gray-500 hover:text-[#212223] transition-colors underline"
              >
                Sign out
              </button>
            </div>
            <ApplicationsCart />
          </div>
        )}
      </section>
    </main>
  );
}

export default function SchoolRegistrationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <SchoolRegistrationContent />
    </Suspense>
  );
}
