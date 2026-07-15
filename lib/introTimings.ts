// Shared mutable intro timing config.
// Updated by IntroDials whenever dials change; read by components on replay.
export const introTimings = {
  patternDuration: 2.3, // s — PS3Silk fade-in
  heroDelay:       0.8, // s — when H1 starts fading in
  heroDuration:    0.8, // s — H1 fade duration (ends at heroDelay + heroDuration)
  gateDuration:    1.9, // s — when intro-done fires
};
