"use client";

export default function Main({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  return (
    <main className={`p-4 ${collapsed ? "md:ml-16" : "md:ml-64"} transition-all duration-200`}>{children}</main>
  );
}
