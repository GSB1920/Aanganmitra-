"use client";

import { useState } from "react";
import Spinner from "./spinner";

export default function ImageWithLoader({ src, alt, className = "", fallback }: { src?: string; alt?: string; className?: string; fallback?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showSrc = !errored && src;
  const placeholder = fallback || "https://placehold.co/600x300/png?text=Loading";
  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Spinner />
        </div>
      )}
      <img
        src={showSrc || placeholder}
        alt={alt || ""}
        className="w-full h-full object-cover"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}
