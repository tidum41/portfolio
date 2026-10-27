/**
 * Hand a value from a server component to a client component's server render
 * (same process, RSC then SSR) without serializing it into the RSC payload.
 * Browsers never read these slots.
 */
export function setSsrSlot(key: string, value: unknown): void {
  Reflect.set(globalThis, key, value);
}

export function getSsrSlot<T>(key: string): T | undefined {
  if (typeof window !== "undefined") return undefined;
  return Reflect.get(globalThis, key) as T | undefined;
}
