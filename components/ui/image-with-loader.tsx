"use client";

import { useState } from "react";
import Image from "next/image";
import Spinner from "./spinner";

export default function ImageWithLoader({ src, alt, className = "", fallback }: { src?: string; alt?: string; className?: string; fallback?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  
  const placeholder = fallback || "https://placehold.co/600x300/png?text=No+Image";
  const showSrc = (!errored && src) ? src : placeholder;
  const isRemote = showSrc.startsWith("http");

  return (
    <div className={`relative ${className} overflow-hidden`}>
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <Spinner />
        </div>
      )}
      {isRemote ? (
        <Image
          src={showSrc}
          alt={alt || ""}
          fill
          className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
          }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
         />
       ) : (
        <img
          src={showSrc}
          alt={alt || ""}
          className="w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
          }}
        />
      )}
    </div>
  );
}
