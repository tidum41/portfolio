import { useRef } from 'react';
import { Album, albums } from '../../data/albums';
import { AlbumCard } from './AlbumCard';
import { DragHint } from '../DragHint/DragHint';
import appStyles from '../../CdPlayerApp.module.css';

type DragDir = 'left' | 'right' | 'up' | 'down' | null;

interface AlbumGridProps {
  activeAlbumId: string | null;
  gridWidth?: number;
  artSize: number;
  colorMap?: Record<string, string>;
  isCarousel?: boolean;
  onAlbumTap?: (album: Album) => void;
  dragDirection?: DragDir;
  showHint?: boolean;
  entranceKey?: number;
  skipEntrance?: boolean;
}

const GRID_GAP = 14;

export function AlbumGrid({ activeAlbumId, gridWidth, artSize, colorMap, isCarousel, onAlbumTap, dragDirection, showHint, entranceKey, skipEntrance = false }: AlbumGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -(artSize + 10), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: artSize + 10, behavior: 'smooth' });
    }
  };

  if (isCarousel) {
    // Match .carouselContainer vertical padding (8px) so chevrons sit on art midlines.
    const arrowTop = 8 + artSize / 2;
    return (
      <div key={entranceKey} style={{ width: '100%' }}>
        {/* Vertical hint lives here — always reserves space so carousel never shifts */}
        <DragHint variant="vertical" visible={showHint} />

        <div className={appStyles.carouselWrap}>
          <button className={`${appStyles.carouselNav} ${appStyles.carouselNavLeft}`} style={{ top: arrowTop }} onClick={scrollLeft} aria-label="Scroll left">
            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className={appStyles.carouselContainer} ref={scrollRef}>
            {albums.map((album, i) => (
              <div key={album.id} style={{ scrollSnapAlign: 'center', flexShrink: 0, width: artSize }}>
                <AlbumCard
                  album={album}
                  isActive={album.id === activeAlbumId}
                  artSize={artSize}
                  resolvedColor={colorMap?.[album.id]}
                  onTap={onAlbumTap}
                  dragDirection={dragDirection}
                  entranceIdx={i}
                  skipEntrance={skipEntrance}
                />
              </div>
            ))}
          </div>

          <button className={`${appStyles.carouselNav} ${appStyles.carouselNavRight}`} style={{ top: arrowTop }} onClick={scrollRight} aria-label="Scroll right">
            <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    );
  }

  // Original Grid logic
  return (
    <div key={entranceKey} style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${artSize}px)`,
      gridAutoRows: 'auto',
      gap: GRID_GAP,
      width: gridWidth,
      alignContent: 'start',
    }}>
      {albums.map((album, i) => (
        <AlbumCard
          key={album.id}
          album={album}
          isActive={album.id === activeAlbumId}
          artSize={artSize}
          resolvedColor={colorMap?.[album.id]}
          onTap={onAlbumTap}
          dragDirection={dragDirection}
          entranceIdx={i}
          skipEntrance={skipEntrance}
        />
      ))}
    </div>
  );
}
