import { AuthProvider } from "@/lib/auth/AuthContext";

// Competition postponed indefinitely (client request, 2026-08-13) — metadata
// commented out so the 404 shown at this route doesn't carry competition SEO.
// export const metadata = {
//   title: "Photo Submission",
//   description:
//     "Submit your entry to My Hometown, My Lens, the international youth photography competition organized by United Media Group.",
// };

export default function PhotoSubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
