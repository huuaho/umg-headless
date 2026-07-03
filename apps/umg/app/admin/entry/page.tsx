import { Suspense } from "react";
import { EntryScoring } from "./EntryScoring";

// Static export + useSearchParams(): the client component must sit inside a
// Suspense boundary or `next build` fails. The fallback is what gets
// prerendered into the static shell.
// NOTE (custom-backend migration): this ?id= query-param route is a
// static-export workaround — switch to /admin/entry/[id] once the frontend
// has a server runtime. Only this wrapper reads the id, so the move is cheap.
export default function AdminEntryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">Loading entry...</p>
        </main>
      }
    >
      <EntryScoring />
    </Suspense>
  );
}
