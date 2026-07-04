"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { SchoolApplicationForm } from "../components/SchoolApplicationForm";

function ApplicationContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const applicationId = idParam ? Number(idParam) : null;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    router.replace("/school-registration");
    return null;
  }

  if (!applicationId || Number.isNaN(applicationId)) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">No application specified.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-280 mx-auto px-6 py-12">
        <SchoolApplicationForm applicationId={applicationId} />
      </section>
    </main>
  );
}

export default function SchoolApplicationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <ApplicationContent />
    </Suspense>
  );
}
