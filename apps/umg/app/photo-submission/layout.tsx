import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata = {
  title: "Photo Submission",
  description:
    "Submit your entry to My Hometown, My Lens, the international youth photography competition organized by United Media Group.",
};

export default function PhotoSubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
