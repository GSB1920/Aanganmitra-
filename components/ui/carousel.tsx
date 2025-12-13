"use client";

import useEmblaCarousel from "embla-carousel-react";
import ImageWithLoader from "./image-with-loader";

export default function Carousel({ images, className = "" }: { images: string[]; className?: string }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  function prev() { embla?.scrollPrev(); }
  function next() { embla?.scrollNext(); }
  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <ImageWithLoader src={src} alt={`image-${i}`} className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded">‹</button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded">›</button>
        </>
      )}
    </div>
  );
}
