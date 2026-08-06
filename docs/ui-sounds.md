# PS3 UI sounds

Two XMB-style clips, mapped by *intent* (not by component name):

| ID | File | Means | Use when |
| --- | --- | --- | --- |
| `option` | `public/audio/ui/snd-option.mp3` | Selecting / navigating | Nav, footer, socials, email, resume, external links, theme toggle, **volume unmute** |
| `push` | `public/audio/ui/button-push.wav` | Entering / confirming | Project cards (case study or popup), archive gallery interactions |

## Rules of thumb

1. **One sound per gesture.** Don’t stack option + push on the same click.
2. **UI ticks vs ambient.** Short UI sounds unlock on the first pointerdown and play on clicks even when background music is muted. The nav volume control is **background music only**; slider level also sets UI tick gain.
3. **Reduced motion.** `prefers-reduced-motion: reduce` disables UI ticks (ambient still opt-in via volume icon).
4. **Chrome vs content.** Habit/CD internals stay quiet — they’re apps, not XMB chrome.
5. **Links vs destinations.** A footer “email” link is `option`. Opening BruínLease is `push`.

## Persistence

- `site-audio-volume` — slider level (UI + ambient when unmuted)
- `site-ambient-muted` — background bed muted state (default `true`)

## Performance

- Web Audio: decode each file **once**, replay via `AudioBufferSourceNode`
- Lazy unlock on first pointerdown / unmute
- Clips are ~50–70ms and a few KB — no streaming, no HTMLAudio pools
- Override with `data-ui-sound="option|push|off"` when delegation isn’t enough
