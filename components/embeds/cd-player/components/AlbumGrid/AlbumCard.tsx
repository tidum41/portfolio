import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Album } from '../../data/albums';
import styles from './AlbumCard.module.css';

type DragDir = 'left' | 'right' | 'up' | 'down' | null;

interface AlbumCardProps {
  album: Album;
  isActive: boolean;
  artSize: number;
  resolvedColor?: string;
  onTap?: (album: Album) => void;
  dragDirection?: DragDir;
  entranceIdx?: number;
  skipEntrance?: boolean;
}

export function AlbumCard({ album, isActive, artSize, resolvedColor, onTap, dragDirection, entranceIdx = 0, skipEntrance = false }: AlbumCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: album.id,
    data: { album },
  });

  // Play the opacity entrance once, then latch the card static. The work-grid
  // CD player is a single live instance that gets re-parented (a DOM move,
  // which restarts CSS animations) from the modal back into the grid tile on
  // close — without this latch, that reparent replays the entrance every time
  // the modal closes. A genuine fresh entrance (the entranceKey bump on modal
  // open, or the first scroll-into-view mount) remounts the card and resets
  // this, so those still animate.
  const [entranceDone, setEntranceDone] = useState(false);
  const isStatic = skipEntrance || entranceDone;

  const handleActivate = () => {
    onTap?.(album);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`${styles.card} ${isStatic ? styles.cardStatic : ''} ${isDragging ? styles.dragging : ''} ${isActive ? styles.active : ''}`}
      style={{ '--entrance-delay': `${entranceIdx * 45}ms` } as React.CSSProperties}
      onAnimationEnd={() => setEntranceDone(true)}
      {...attributes}
      {...listeners}
      role="button"
      aria-label={`Load ${album.title} by ${album.artist}`}
      aria-pressed={isActive}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.artWrap}
        style={{ width: artSize, height: artSize }}
      >
        {/* Album art — z-index 1001 when dragging so it sits ABOVE the fixed disc (z-index 1000),
            creating the illusion that the disc emerges from behind this cover */}
        <div
          className={styles.art}
          style={{
            backgroundColor: resolvedColor ?? album.color,
            backgroundImage: album.artUrl ? `url(${album.artUrl})` : undefined,
            // When dragging and direction established: raise above fixed disc so cover hides its origin
            zIndex: isDragging && dragDirection !== null ? 1001 : 1,
          }}
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.title}>{album.title}</span>
        <span className={styles.artist}>{album.artist}</span>
      </div>
    </div>
  );
}
