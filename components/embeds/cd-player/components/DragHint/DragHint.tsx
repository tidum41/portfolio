import styles from './DragHint.module.css';

/** Minimal platter-style disc — outer ring + center hub, no grooves. */
function HintDiscIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      className={styles.disc}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="6.8"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <circle
        cx="8"
        cy="8"
        r="1.9"
        fill="var(--cd-bg-color, #e0e0e0)"
        stroke="currentColor"
        strokeWidth="0.85"
      />
    </svg>
  );
}

function HintArrow({ variant }: { variant: 'horizontal' | 'vertical' }) {
  if (variant === 'vertical') {
    return (
      <svg className={styles.arrow} width="8" height="9" viewBox="0 0 8 9" fill="none" aria-hidden>
        <path
          d="M4 8V1M4 1L1.25 3.75M4 1L6.75 3.75"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className={styles.arrow} width="9" height="8" viewBox="0 0 9 8" fill="none" aria-hidden>
      <path
        d="M8 4H1M1 4L3.75 1.25M1 4L3.75 6.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DragHintProps {
  variant: 'horizontal' | 'vertical';
  visible?: boolean;
}

export function DragHint({ variant, visible = true }: DragHintProps) {
  return (
    <div
      className={`${styles.hint} ${variant === 'horizontal' ? styles.hintH : styles.hintV}`}
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <span className={styles.row}>
        <HintDiscIcon />
        <HintArrow variant={variant} />
        <span className={styles.label}>drag to play</span>
      </span>
    </div>
  );
}
