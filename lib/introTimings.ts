// Shared mutable intro timing config.
// Updated by IntroDials whenever dials change; read by components on replay.
export const introTimings = {
  patternDuration: 2.4, // s — PS3Silk fade-in
  heroDelay:       1.6, // s — when H1 starts fading in
  heroDuration:    0.9, // s — H1 fade duration (ends at heroDelay + heroDuration)
  gateDuration:    2.4, // s — when intro-done fires
};

