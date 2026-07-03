"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { AuthForm } from "@/app/photo-submission/components/AuthForm";

/**
 * Client-side gate for the judging dashboard. This is UX only — the real
 * security boundary is the capability check the plugin performs on every
 * /admin/* REST request. Anyone can log in (the contest signup creates
 * accounts freely); only users granted the judge role get past the API.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <section className="max-w-280 mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold text-[#212223] text-center mb-2">
            Judging Dashboard
          </h1>
          <p className="text-gray-500 text-center mb-10">
            Judges only — sign in with your registered email.
          </p>
          <AuthForm />
        </section>
      </main>
    );
  }

  if (!user.is_judge) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <h1 className="text-2xl font-bold text-[#212223] mb-3">
            Not authorized
          </h1>
          <p className="text-gray-600 mb-6">
            This account ({user.email}) does not have judge access. If you
            believe this is a mistake, contact the competition organizers.
          </p>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
