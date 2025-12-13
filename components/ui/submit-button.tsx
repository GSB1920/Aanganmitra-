"use client";

import { useFormStatus } from "react-dom";
import Spinner from "./spinner";

export default function SubmitButton({ children, variant = "primary", className = "", disabled = false }: { children: React.ReactNode; variant?: "primary" | "secondary" | "danger"; className?: string; disabled?: boolean; }) {
  const { pending } = useFormStatus();
  const base = "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return (
    <button type="submit" disabled={pending || disabled} className={`${base} ${styles} ${className}`}>
      {pending && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
