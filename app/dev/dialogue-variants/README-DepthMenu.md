# DepthMenu (dev only, PENDING Mudit's OK)

Option 4 of the depth compare: the depth for one reply, picked from a menu in the composer the way a model is picked in Cursor or ChatGPT.

When to use: only on `/dev/dialogue-variants` and `/dev/dialogue-depth-figures`. It is not on the SYSTEM-COMPONENTS allowlist, so `/dialogue` must not import it.

How it is built:
- Trigger: the depth tab chip's type and fills (`--dp-muted` text, `--dp-warm` hover, `--dp-nav-active-bg` press and open), the product `ChevronDownIcon`.
- Menu: the tooltip chip's surface (`--dp-surface`, `--dp-border`, `--shadow-chat`, `--dp-radius-control`), rows with the product `CheckIcon` in a fixed 16px lane so picking never shifts text.
- Motion: 150ms ease-out, grows from the trigger (scale 0.97 and 4px), fade only under reduced motion.
- Keyboard: Enter, Space or an arrow on the trigger opens on the checked row; arrows, Home and End move; Enter or Space picks and closes; Escape and Tab close; focus returns to the trigger. A press outside closes without picking.

Props: `value`, `onChange`, `open`, `onOpenChange` (controlled). Depths are the typed union `Depth` (`Insight | Chart | People`).
