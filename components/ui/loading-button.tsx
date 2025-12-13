"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./spinner";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => Promise<void> | void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  className?: string;
  disabled?: boolean;
};

export default function LoadingButton({ children, href, onClick, type = "button", variant = "primary", loading, className = "", disabled }: Props) {
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const router = useRouter();
  const isLoading = loading ?? localLoading;

  const base = "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
  }[variant];

  async function handleClick() {
    if (href) {
      setLocalLoading(true);
      router.push(href);
      return;
    }
    if (onClick) {
      try {
        setLocalLoading(true);
        await onClick();
      } finally {
        setLocalLoading(false);
      }
    }
  }

  return (
    <button type={type} onClick={handleClick} disabled={isLoading || disabled} className={`${base} ${styles} ${className}`}>
      {isLoading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
