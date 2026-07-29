"use client";

import { useState, useEffect, useRef } from 'react';
import { CaretLeft, CaretRight, Sun, Moon, Check } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HabitTrackerApp.module.css';

/** Deterministic PRNG seed from calendar year + month (0-indexed). */
function monthSeedKey(year: number, month: number): number {
  return ((year * 12 + month) * 2654435761) >>> 0;
}

function createSeededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Demo seed for a month: one 4-day run (anchored near the latest selectable
 * day so the streak UI reads on load) plus 2–3 scattered singles, none adjacent.
 */
function generateMonthSeedDates(year: number, month: number, refDate: Date): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rand = createSeededRand(monthSeedKey(year, month));

  const ref = new Date(refDate);
  ref.setHours(0, 0, 0, 0);
  const isCurrentMonth = year === ref.getFullYear() && month === ref.getMonth();
  const maxDay = isCurrentMonth ? ref.getDate() : daysInMonth;
  if (maxDay < 4) return [];

  const slack = maxDay - 4;
  const blockEndOffset = Math.floor(rand() * (Math.min(3, slack) + 1));
  const blockEnd = maxDay - blockEndOffset;
  const blockStart = blockEnd - 3;

  const selected = new Set<number>();
  for (let d = blockStart; d <= blockEnd; d++) selected.add(d);

  const isAdjacentToAny = (day: number) => {
    for (const d of selected) {
      if (Math.abs(day - d) <= 1) return true;
    }
    return false;
  };

  const targetTotal = 4 + 2 + Math.floor(rand() * 2); // 6 or 7 days
  let attempts = 0;
  while (selected.size < targetTotal && attempts < 200) {
    attempts++;
    const day = 1 + Math.floor(rand() * maxDay);
    if (!isAdjacentToAny(day)) selected.add(day);
  }

  return Array.from(selected).map((day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );
}

function ensureMonthSeeded(
  monthDate: Date,
  selected: Set<string>,
  refDate: Date,
): void {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const hasAnyInMonth = [...selected].some((key) => {
    const d = new Date(key + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });
  if (hasAnyInMonth) return;
  generateMonthSeedDates(year, month, refDate).forEach((key) => selected.add(key));
}

const HABIT_PLACEHOLDER = 'type habit here';

function normalizeHabitTitle(value: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  return trimmed.toLowerCase() === HABIT_PLACEHOLDER ? '' : value;
}

// Ported from the standalone Habit Tracker app (github.com/tidum41/habittracker) —
// the framer-pointer postMessage forwarding and the parent-window theme sync
// both only existed for the Framer-iframe embedding case and are gone here.
// The theme toggle is intentionally its OWN independent state (not the site's
// data-theme) — seeded once from the page's theme on mount, then fully
// decoupled, matching how the standalone app behaves today.
//
// Theme is applied via data-theme on the root (not Tailwind's `dark:` variant)
// because that variant resolves against ANY ancestor with data-theme="dark" —
// including the site's own <html>, which this widget is always nested inside.
export default function HabitTrackerApp({
  onThemeChange,
  forcedTheme,
  inert = false,
}: {
  onThemeChange?: (theme: 'light' | 'dark') => void;
  /** Lock theme to a parent-controlled value (used by the grid poster clone). */
  forcedTheme?: 'light' | 'dark';
  /** Non-interactive stand-in — no pointer events, not focusable. */
  inert?: boolean;
}) {
  const [currentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [habitTitle, setHabitTitle] = useState('');
  const habitInputRef = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState(1);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(forcedTheme ?? 'light');

  useEffect(() => {
    const refDate = new Date();
    const initialMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const saved = localStorage.getItem('habit-selected-dates');
    const dates = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    ensureMonthSeeded(initialMonth, dates, refDate);
    setSelectedDates(dates);

    const savedTitle = normalizeHabitTitle(localStorage.getItem('habit-title'));
    if (savedTitle) {
      setHabitTitle(savedTitle);
    } else {
      localStorage.removeItem('habit-title');
    }

    if (!forcedTheme) {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'dark' || attr === 'light') setResolvedTheme(attr);
    }
  }, [forcedTheme]);

  useEffect(() => {
    if (forcedTheme) setResolvedTheme(forcedTheme);
  }, [forcedTheme]);

  useEffect(() => {
    if (inert) return;
    onThemeChange?.(resolvedTheme);
  }, [resolvedTheme, onThemeChange, inert]);

  const toggleTheme = () => {
    if (inert || forcedTheme) return;
    setResolvedTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const focusHabitTitleAtEnd = () => {
    const input = habitInputRef.current;
    if (!input) return;
    const len = input.value.length;
    requestAnimationFrame(() => {
      input.setSelectionRange(len, len);
    });
  };

  const calculateStreak = () => {
    const sortedDates = Array.from(selectedDates).sort().reverse();
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = formatDateKey(checkDate);
      if (selectedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0 && streak === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = formatDateKey(checkDate);
        if (selectedDates.has(yesterdayStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const toggleDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateKey)) {
      newSelected.delete(dateKey);
    } else {
      newSelected.add(dateKey);
    }
    setSelectedDates(newSelected);
    localStorage.setItem('habit-selected-dates', JSON.stringify([...newSelected]));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    if (dir === 'next' && isAtCurrentMonth) return;
    setDirection(dir === 'next' ? 1 : -1);
    const newMonth = new Date(currentMonth);
    if (dir === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    const seeded = new Set(selectedDates);
    ensureMonthSeeded(newMonth, seeded, currentDate);
    setSelectedDates(seeded);
    setCurrentMonth(newMonth);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0 }),
  };

  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const formatDateDisplay = (date: Date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st'
      : day === 2 || day === 22 ? 'nd'
      : day === 3 || day === 23 ? 'rd' : 'th';
    return `${dayName}, ${monthName} ${day}${suffix}`;
  };

  const formatDayAriaLabel = (date: Date, isSelected: boolean, isFuture: boolean, isToday: boolean) => {
    const dateLabel = formatDateDisplay(date);
    const todaySuffix = isToday ? ', today' : '';
    if (isFuture) return `${dateLabel}, unavailable${todaySuffix}`;
    if (isSelected) return `${dateLabel}, completed${todaySuffix}`;
    return `${dateLabel}, not completed${todaySuffix}`;
  };

  const isAtCurrentMonth =
    currentMonth.getFullYear() === currentDate.getFullYear() &&
    currentMonth.getMonth() === currentDate.getMonth();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarSpacer} aria-hidden />);
    }

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = formatDateKey(date);
      const isSelected = selectedDates.has(dateKey);
      const isToday = date.toDateString() === currentDate.toDateString();
      const isFuture = date > today;

      const cellClasses = [
        styles.dayCell,
        isFuture ? styles.dayCellFuture : '',
        isToday ? styles.dayCellToday : '',
        isSelected ? styles.dayCellSelected : '',
      ].filter(Boolean).join(' ');

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isFuture && toggleDate(date)}
          disabled={isFuture}
          aria-label={formatDayAriaLabel(date, isSelected, isFuture, isToday)}
          aria-pressed={isSelected}
          className={cellClasses}
        >
          {isSelected ? (
            <Check className={styles.checkIcon} size={16} weight="bold" aria-hidden />
          ) : (
            <span className={styles.dayNumber}>{day}</span>
          )}
        </button>
      );
    }

    return days;
  };

  const streak = calculateStreak();
  const daysInCurrentMonth = getDaysInMonth(currentMonth);
  const completedDaysThisMonth = Array.from(selectedDates).filter(dateStr => {
    const date = new Date(dateStr);
    return date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear();
  }).length;

  return (
    <div
      className={styles.root}
      data-theme={resolvedTheme}
      aria-hidden={inert || undefined}
      {...(inert ? { inert: true as const } : {})}
      style={inert ? { pointerEvents: 'none', userSelect: 'none' } : undefined}
    >
      <header className={styles.header}>
        <button
          type="button"
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark'
            ? <Sun size={23} weight="light" aria-hidden />
            : <Moon size={23} weight="light" aria-hidden />}
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <input
            ref={habitInputRef}
            type="text"
            value={habitTitle}
            placeholder={HABIT_PLACEHOLDER}
            onChange={(e) => {
              const value = e.target.value;
              setHabitTitle(value);
              if (value.trim()) localStorage.setItem('habit-title', value);
              else localStorage.removeItem('habit-title');
            }}
            onFocus={focusHabitTitleAtEnd}
            className={styles.habitTitle}
            aria-label="Habit name"
          />
          <p className={styles.dateLabel}>{formatDateDisplay(currentDate)}</p>
        </div>

        <div className={styles.monthNav}>
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            className={styles.navButton}
            aria-label="Previous month"
          >
            <CaretLeft size={18} weight="bold" aria-hidden />
          </button>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.p
              key={currentMonth.getTime()}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={styles.monthLabel}
            >
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </motion.p>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => navigateMonth('next')}
            className={styles.navButton}
            aria-label="Next month"
            disabled={isAtCurrentMonth}
          >
            <CaretRight size={18} weight="bold" aria-hidden />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentMonth.getTime()}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={styles.calendarSection}
          >
            <div className={styles.dayHeaders}>
              {dayNames.map(day => (
                <p key={day} className={styles.dayHeader} aria-hidden>
                  {day}
                </p>
              ))}
            </div>
            <div className={styles.calendarGrid}>
              {renderCalendar()}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className={styles.stats}>
          <p className={styles.streakLabel}>{streak} day streak</p>
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={completedDaysThisMonth} aria-valuemin={0} aria-valuemax={daysInCurrentMonth} aria-label="Monthly completion">
            <div
              className={styles.progressFill}
              style={{ width: `${(completedDaysThisMonth / daysInCurrentMonth) * 100}%` }}
            />
          </div>
          <p className={styles.progressLabel}>
            {completedDaysThisMonth}/{daysInCurrentMonth} days
          </p>
        </div>
      </div>
    </div>
  );
}
