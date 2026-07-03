import type { Photo } from "@/lib/photography";

interface PhotoGridProps {
  photos: Photo[];
  showCaptions?: boolean;
}

export default function PhotoGrid({ photos, showCaptions = true }: PhotoGridProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {photos.map((photo) => (
        <div key={photo.slug} className="break-inside-avoid">
          <div className="group relative rounded-lg overflow-hidden">
            {/* Placeholder colour block — replaced by next/image when real images exist */}
            <div
              style={{
                aspectRatio: photo.aspectRatio,
                background: photo.placeholderBg,
              }}
              className="w-full"
              role="img"
              aria-label={photo.alt}
            />

            {/* Caption overlay */}
            {showCaptions && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <p className="text-xs text-white leading-snug">{photo.caption}</p>
              </div>
            )}
          </div>

          {/* Always-visible caption below (fallback for touch devices) */}
          {showCaptions && (
            <p className="text-xs text-subtle mt-2 px-0.5">{photo.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}
