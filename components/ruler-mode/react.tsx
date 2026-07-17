import { useRef } from "react";
import {
	RulerMode,
	type RulerModeAppearance,
	type RulerModeOptions,
} from "./ruler-mode";

/**
 * Drop-in mount point: `<RulerModeOverlay appearance="dark" />` anywhere in
 * the tree. Everything is driven by the keyboard (Shift+R to toggle,
 * Ctrl+Shift+R to hide while in ruler mode).
 *
 * No `useEffect` anywhere: the RulerMode lifecycle lives entirely in a ref
 * callback that is created lazily ONCE — React calls it with the marker
 * element on mount (construct) and with `null` on unmount (destroy). The
 * prop→instance syncs in the render body are refs-only and idempotent, so
 * re-renders (StrictMode included) are no-ops that never touch React output.
 *
 * Options are read once at construction, except `appearance`, which is
 * applied live when the prop changes.
 */
export function RulerModeOverlay(options: RulerModeOptions) {
	const modeRef = useRef<RulerMode | null>(null);
	const optionsRef = useRef(options);
	optionsRef.current = options;

	const lastAppearance = useRef<RulerModeAppearance | undefined>(
		options.appearance,
	);
	if (options.appearance !== lastAppearance.current) {
		lastAppearance.current = options.appearance;
		if (options.appearance) modeRef.current?.setAppearance(options.appearance);
	}

	// created once and reused: a fresh callback each render would make React
	// detach/reattach the node every render, tearing the overlay down with it
	const attach = useRef<((el: HTMLElement | null) => void) | null>(null);
	if (!attach.current) {
		attach.current = (el) => {
			if (el) {
				modeRef.current = new RulerMode(optionsRef.current);
			} else {
				modeRef.current?.destroy();
				modeRef.current = null;
			}
		};
	}

	return <span hidden ref={attach.current} />;
}
