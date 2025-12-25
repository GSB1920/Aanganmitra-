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
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "bg-transparent text-primary hover:bg-primary/10",
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
