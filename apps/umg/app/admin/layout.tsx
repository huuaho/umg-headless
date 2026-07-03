import { AuthProvider } from "@/lib/auth/AuthContext";
import { AdminGuard } from "./AdminGuard";

export const metadata = {
  title: "Judging Dashboard",
  description: "United Media Group competition judging dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
