import "./globals.css";
import { supabaseServer } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import NextTopLoader from 'nextjs-toploader';

export const metadata = {
  title: "Aangan Mitra",
  description: "Property management",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  return (
    <html lang="en">
      <body>
        <NextTopLoader color="#2563EB" showSpinner={false} />
        <AppShell userPresent={!!user} isAdmin={role === "admin"}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
