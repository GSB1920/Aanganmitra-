"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UploadCtx = { uploading: boolean; setUploading: (v: boolean) => void };
const Ctx = createContext<UploadCtx | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    function onEvt(e: Event) {
      const d = (e as CustomEvent<boolean>).detail;
      if (typeof d === "boolean") setUploading(d);
    }
    window.addEventListener("uploading_change", onEvt as EventListener);
    return () => window.removeEventListener("uploading_change", onEvt as EventListener);
  }, []);

  return <Ctx.Provider value={{ uploading, setUploading }}>{children}</Ctx.Provider>;
}

export function useUploadContext() {
  const v = useContext(Ctx);
  if (!v) return { uploading: false, setUploading: () => {} };
  return v;
}
