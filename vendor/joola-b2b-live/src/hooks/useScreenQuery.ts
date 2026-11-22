import { useCallback, useEffect, useState } from "react";
import {
  getReplayToken,
  isForcedEmpty,
  isForcedLoading,
  isForcedSyncing,
  MockApiError,
  mockRequest,
  subscribeReplay,
  type ScreenKey,
} from "../api/mock";

type Status = "idle" | "loading" | "ready" | "error" | "empty";

export function useScreenQuery<T>(
  screen: ScreenKey,
  loader: () => T | Promise<T>,
  deps: unknown[] = [],
) {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<MockApiError | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    return subscribeReplay(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    (async () => {
      try {
        if (isForcedLoading(screen)) {
          // Hold the skeleton forever while DialKit forces loading
          // (including ?clean=1 where mock latency is zero).
          return;
        }
        const result = await mockRequest(screen, loader);
        if (cancelled) return;
        if (isForcedEmpty(screen)) {
          setData(result);
          setStatus("empty");
          return;
        }
        setData(result);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof MockApiError
            ? e
            : new MockApiError(
                "Something went wrong.",
                "server",
                "Try again. If it keeps failing, message your JOOLA rep.",
              ),
        );
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, tick, getReplayToken(), ...deps]);

  return {
    status,
    data,
    error,
    reload,
    syncing: isForcedSyncing(screen),
  };
}
