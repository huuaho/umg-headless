import { AuthProvider } from "@/lib/auth/AuthContext";

export default function PhotoSubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
