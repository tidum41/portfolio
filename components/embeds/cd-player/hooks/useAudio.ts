import { useRef, useState, useCallback, useEffect } from 'react';
import type { Album } from '../data/albums';

// Fallback sample tracks when no audioUrl is provided on the album
const FALLBACK_TRACKS: Record<string, string> = {
  '1': 'https://cdn.pixabay.com/audio/2024/11/29/audio_f0a4626ca0.mp3',
  '2': 'https://cdn.pixabay.com/audio/2024/08/27/audio_3f2f67e4db.mp3',
  '3': 'https://cdn.pixabay.com/audio/2022/10/25/audio_d5d3c8d184.mp3',
  '4': 'https://cdn.pixabay.com/audio/2024/09/03/audio_39a8cb2c09.mp3',
  '5': 'https://cdn.pixabay.com/audio/2024/02/14/audio_8cee508e20.mp3',
  '6': 'https://cdn.pixabay.com/audio/2022/05/16/audio_1333dfec84.mp3',
  '7': 'https://cdn.pixabay.com/audio/2023/10/23/audio_3f20632e5f.mp3',
  '8': 'https://cdn.pixabay.com/audio/2022/03/24/audio_53bcfe43c8.mp3',
  '9': 'https://cdn.pixabay.com/audio/2024/01/17/audio_fb68a0b4d5.mp3',
};

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceConnectedRef = useRef(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.addEventListener('error', () => {
        setAudioError('Failed to load audio track. Check your connection and try again.');
      });
    }
    return audioRef.current;
  }, [volume]);

  /** Connect the audio element to an AnalyserNode (call once per audio element, on user gesture) */
  const connectAudioGraph = useCallback((audio: HTMLAudioElement) => {
    if (sourceConnectedRef.current) {
      audioCtxRef.current?.resume();
      return;
    }
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;               // fewer bins = faster, more punchy response
      analyser.smoothingTimeConstant = 0.55; // less smoothing = more reactive
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceConnectedRef.current = true;
      ctx.resume();
    } catch {
      // Web Audio not available — visualizer stays decorative
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const clearAudioError = useCallback(() => setAudioError(null), []);

  const handlePlayRejection = useCallback((err: unknown) => {
    const name = err instanceof DOMException ? err.name : '';
    if (name === 'NotAllowedError') {
      setAudioError('Playback blocked. Interact with the player to enable audio.');
    } else {
      setAudioError('Unable to play audio. Check your connection and try again.');
    }
  }, []);

  /**
   * Load and play audio for an album.
   * Uses album.audioUrl if provided, otherwise falls back to sample tracks.
   */
  const loadAndPlay = useCallback((album: Album) => {
    setAudioError(null);
    const audio = getAudio();
    const src = album.audioUrl || FALLBACK_TRACKS[album.id] || FALLBACK_TRACKS['1'];

    // Always reassign + load: clears any error state and avoids the
    // absolute-vs-relative URL mismatch that caused the old !== check to
    // always reset without a proper load().
    audio.src = src;
    audio.load();

    connectAudioGraph(audio);

    // AudioContext.resume() is async — if the context is suspended we must
    // await it before calling play(), otherwise play() silently fails.
    const ctx = audioCtxRef.current;
    const doPlay = () => audio.play().then(() => setAudioError(null)).catch(handlePlayRejection);
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(doPlay).catch(handlePlayRejection);
    } else {
      doPlay();
    }
  }, [getAudio, connectAudioGraph, handlePlayRejection]);

  const playAudio = useCallback(() => {
    const audio = getAudio();
    audioCtxRef.current?.resume();
    audio.play().then(() => setAudioError(null)).catch(handlePlayRejection);
  }, [getAudio, handlePlayRejection]);

  const pauseAudio = useCallback(() => {
    getAudio().pause();
    // Suspend the graph while paused so a live grid preview isn't keeping
    // an AudioContext in the running state after the modal closes.
    void audioCtxRef.current?.suspend?.();
  }, [getAudio]);

  const stopAudio = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    audio.src = '';
    void audioCtxRef.current?.suspend?.();
  }, [getAudio]);

  const volumeUp = useCallback(() => {
    setVolume(v => Math.min(1, +(v + 0.1).toFixed(1)));
  }, []);

  const volumeDown = useCallback(() => {
    setVolume(v => Math.max(0, +(v - 0.1).toFixed(1)));
  }, []);

  /**
   * Apply playback rate during scratch (deg/ms → rate).
   * Normal disc speed ≈ 360°/16s = 22.5 deg/s = 0.0225 deg/ms.
   * Pass 0 to reset to normal rate.
   */
  const scratchAudio = useCallback((degPerMs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (degPerMs === 0) {
      audio.playbackRate = 1.0;
      audio.play().catch(handlePlayRejection);
    } else {
      const normalDegPerMs = 360 / (16 * 1000);
      const rate = degPerMs / normalDegPerMs;
      if (rate < 0) {
        // browsers can't reverse audio — pause while timestamp rewinds visually
        audio.pause();
      } else {
        if (audio.paused) audio.play().catch(handlePlayRejection);
        audio.playbackRate = Math.max(0.05, Math.min(3.5, rate));
      }
    }
  }, [handlePlayRejection]);

  /**
   * Call synchronously inside a user gesture (tap/click/drag-end) to unlock the
   * AudioContext on iOS Safari BEFORE any async delay (e.g. snap animation setTimeout).
   * Without this, audio.play() called 1300ms later is outside the gesture and gets blocked.
   */
  const primeAudio = useCallback(() => {
    const audio = getAudio();
    connectAudioGraph(audio);
  }, [getAudio, connectAudioGraph]);

  // Release HTMLAudio + WebAudio when the player unmounts (e.g. leaving "/").
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      audioRef.current = null;
      const ctx = audioCtxRef.current;
      audioCtxRef.current = null;
      analyserRef.current = null;
      sourceConnectedRef.current = false;
      if (ctx && ctx.state !== "closed") {
        void ctx.close().catch(() => {});
      }
    };
  }, []);

  return { loadAndPlay, playAudio, pauseAudio, stopAudio, volumeUp, volumeDown, volume, analyserRef, scratchAudio, primeAudio, audioError, clearAudioError };
}
