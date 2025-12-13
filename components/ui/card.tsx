"use client";

export function Card({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`bg-white border rounded-md shadow ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`px-4 py-3 border-b ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`p-4 space-y-4 ${className}`}>{children}</div>;
}
