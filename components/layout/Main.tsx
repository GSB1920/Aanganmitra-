"use client";

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="p-4 transition-all duration-200">
      {children}
    </main>
  );
}
