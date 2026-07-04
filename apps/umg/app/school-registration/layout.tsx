import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata = {
  title: "School Registration",
  description:
    "Register multiple students on behalf of your school for My Hometown, My Lens, the international youth photography competition organized by United Media Group.",
};

export default function SchoolRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
