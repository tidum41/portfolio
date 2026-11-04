import { useEffect, useRef } from 'react';
import styles from './AudioConsent.module.css';

interface AudioConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function AudioConsent({ onAccept, onDecline }: AudioConsentProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Animate in on mount
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    requestAnimationFrame(() => {
      card.classList.add(styles.visible);
    });
  }, []);

  return (
    <div className={styles.overlay}>
      <div ref={cardRef} className={styles.card}>
        <div className={styles.message}>
          Warning: Music will<br />play (and sound good)
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnOn}`} onClick={onAccept}>
            Sound on
          </button>
          <button className={`${styles.btn} ${styles.btnOff}`} onClick={onDecline}>
            Mute
          </button>
        </div>
      </div>
    </div>
  );
}
