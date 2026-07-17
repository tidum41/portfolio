/**
 * ruler-mode — lightweight, Figma-style rulers & draggable guides for any web app.
 *
 * - `Shift+R` (Figma's rulers shortcut) toggles ruler mode on/off.
 * - `Ctrl+Shift+R` hides/shows rulers + guides while staying in ruler mode.
 * - Drag from the left ruler to pull out a vertical guide, from the top ruler
 *   for a horizontal guide. Positions are true viewport CSS px.
 * - Click a guide to select it, `Delete`/`Backspace` removes it, arrows nudge
 *   it (Shift = 10px), `Esc` deselects, right-click removes, Alt-drag duplicates.
 * - Drag a guide back onto its ruler (or off-screen) to delete it — like Figma.
 *
 * Zero dependencies. Rulers are drawn on two canvases (repainted only via rAF
 * on resize/guide changes); guides are single DOM nodes moved with transforms,
 * so dragging never triggers React renders or layout thrash.
 */

export type GuideAxis = "x" | "y";

export interface Guide {
	id: number;
	/** "x" = vertical guide (position along the x axis), "y" = horizontal guide. */
	axis: GuideAxis;
	/** Viewport position in CSS px. */
	pos: number;
}

export interface RulerModeTheme {
	rulerBg: string;
	rulerBorder: string;
	tick: string;
	tickLabel: string;
	labelFont: string;
	/** Guide + badge color (Figma guide red by default). */
	guide: string;
	/** Selected/active guide color (Figma selection blue by default). */
	guideActive: string;
}

export type RulerModeAppearance = "light" | "dark";

export interface RulerModeOptions {
	/** Light or dark ruler panels. Defaults to "light". */
	appearance?: RulerModeAppearance;
	/** z-index of the overlay root. Defaults to 2147483000. */
	zIndex?: number;
	/**
	 * localStorage key used to persist guides across reloads.
	 * Pass `null` to disable persistence. Defaults to "ruler-mode.guides".
	 */
	storageKey?: string | null;
	theme?: Partial<RulerModeTheme>;
	/** Called after any state change (toggle, hide, guide add/move/remove). */
	onChange?: (mode: RulerMode) => void;
}

const RULER = 20; // ruler thickness in px
const HIT = 4; // grab padding on each side of a guide line

const LIGHT_THEME: RulerModeTheme = {
	rulerBg: "#ffffff",
	rulerBorder: "rgba(0, 0, 0, 0.12)",
	tick: "#d4d4d4",
	tickLabel: "#9b9b9b",
	labelFont: "9px system-ui, -apple-system, sans-serif",
	guide: "#f24822",
	guideActive: "#0c8ce9",
};

// Figma dark-UI palette
const DARK_THEME: RulerModeTheme = {
	rulerBg: "#2c2c2c",
	rulerBorder: "rgba(255, 255, 255, 0.13)",
	tick: "#4f4f4f",
	tickLabel: "#8c8c8c",
	labelFont: "9px system-ui, -apple-system, sans-serif",
	guide: "#f24822",
	guideActive: "#0c8ce9",
};

const themeFor = (appearance: RulerModeAppearance | undefined) =>
	appearance === "dark" ? DARK_THEME : LIGHT_THEME;

const CSS = `
.rm-root{position:fixed;inset:0;pointer-events:none}
.rm-ruler{position:absolute;top:0;left:0;display:block;pointer-events:auto;touch-action:none;user-select:none}
.rm-corner{position:absolute;top:0;left:0;width:${RULER}px;height:${RULER}px;pointer-events:auto;background:var(--rm-ruler-bg);box-shadow:inset -1px -1px 0 var(--rm-ruler-border)}
.rm-guides{position:absolute;inset:0;pointer-events:none}
.rm-guide{position:absolute;top:0;left:0;pointer-events:auto;touch-action:none;will-change:transform}
.rm-guide[data-axis="x"]{height:100%;width:${HIT * 2 + 1}px;cursor:ew-resize}
.rm-guide[data-axis="y"]{width:100%;height:${HIT * 2 + 1}px;cursor:ns-resize}
.rm-guide::before{content:"";position:absolute;background:var(--rm-guide)}
.rm-guide[data-axis="x"]::before{left:${HIT}px;top:0;height:100%;width:1px}
.rm-guide[data-axis="y"]::before{top:${HIT}px;left:0;width:100%;height:1px}
.rm-guide[data-selected]::before{background:var(--rm-active);box-shadow:0 0 0 .5px var(--rm-active)}
.rm-badge{position:absolute;top:0;left:0;pointer-events:none;background:var(--rm-guide);color:#fff;font:500 10px/1 system-ui,-apple-system,sans-serif;padding:3px 5px;border-radius:3px;white-space:nowrap;display:none;will-change:transform}
`;

let styleRefs = 0;
let styleEl: HTMLStyleElement | null = null;

function acquireStyles() {
	if (styleRefs++ === 0) {
		styleEl = document.createElement("style");
		styleEl.dataset.rulerMode = "";
		styleEl.textContent = CSS;
		document.head.appendChild(styleEl);
	}
}

function releaseStyles() {
	if (--styleRefs === 0) {
		styleEl?.remove();
		styleEl = null;
	}
}

function isTypingTarget(t: EventTarget | null): boolean {
	if (!(t instanceof HTMLElement)) return false;
	if (t.isContentEditable) return true;
	const tag = t.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

const clamp = (n: number, min: number, max: number) =>
	Math.min(Math.max(n, min), max);

export class RulerMode {
	readonly supported =
		typeof window !== "undefined" && typeof document !== "undefined";

	private theme: RulerModeTheme;
	private themeOverrides: Partial<RulerModeTheme>;
	private storageKey: string | null;
	private onChange: RulerModeOptions["onChange"];

	private root!: HTMLDivElement;
	private topCanvas!: HTMLCanvasElement;
	private leftCanvas!: HTMLCanvasElement;
	private guidesLayer!: HTMLDivElement;
	private badge!: HTMLDivElement;
	private guideEls = new Map<number, HTMLDivElement>();

	private guides: Guide[] = [];
	private nextId = 1;
	private selectedId: number | null = null;
	private dragging = false;
	private _enabled = false;
	private _hidden = false;
	private appearance: RulerModeAppearance;
	private raf = 0;
	private dirtyX = false;
	private dirtyY = false;
	private saveTimer: ReturnType<typeof setTimeout> | undefined;
	private prevCursor = "";

	constructor(options: RulerModeOptions = {}) {
		this.themeOverrides = options.theme ?? {};
		this.appearance = options.appearance ?? "light";
		this.theme = { ...themeFor(options.appearance), ...this.themeOverrides };
		this.storageKey =
			options.storageKey === undefined
				? "ruler-mode.guides"
				: options.storageKey;
		this.onChange = options.onChange;
		if (!this.supported) return;
		acquireStyles();
		this.buildDom(options.zIndex ?? 2147483000);
		this.applyThemeVars();
		this.loadGuides();
		window.addEventListener("keydown", this.onKeyDown, true);
	}

	get enabled() {
		return this._enabled;
	}

	get hidden() {
		return this._hidden;
	}

	getGuides(): readonly Guide[] {
		return this.guides.map((g) => ({ ...g }));
	}

	toggle() {
		if (this._enabled) this.disable();
		else this.enable();
	}

	enable() {
		if (!this.supported || this._enabled) return;
		this._enabled = true;
		this._hidden = false;
		this.root.style.display = "block";
		document.addEventListener("pointerdown", this.onDocPointerDown, true);
		window.addEventListener("resize", this.onResize);
		this.drawRulers();
		this.emit();
	}

	disable() {
		if (!this._enabled) return;
		this._enabled = false;
		this.root.style.display = "none";
		document.removeEventListener("pointerdown", this.onDocPointerDown, true);
		window.removeEventListener("resize", this.onResize);
		this.select(null);
		this.hideBadge();
		this.emit();
	}

	/** Switch between light and dark ruler panels at runtime. */
	setAppearance(appearance: RulerModeAppearance) {
		if (appearance === this.appearance) return;
		this.appearance = appearance;
		this.theme = { ...themeFor(appearance), ...this.themeOverrides };
		if (!this.supported) return;
		this.applyThemeVars();
		if (this._enabled && !this._hidden) this.drawRulers();
	}

	/** Hide/show the whole overlay while staying in ruler mode (Ctrl+Shift+R). */
	setHidden(hidden: boolean) {
		if (!this._enabled || this._hidden === hidden) return;
		this._hidden = hidden;
		this.root.style.display = hidden ? "none" : "block";
		if (!hidden) this.drawRulers();
		this.emit();
	}

	addGuide(axis: GuideAxis, pos: number): Guide {
		const guide = this.insertGuide(axis, Math.round(pos));
		this.commit();
		return { ...guide };
	}

	removeGuide(id: number) {
		const i = this.guides.findIndex((g) => g.id === id);
		if (i === -1) return;
		const axis = this.guides[i].axis;
		this.guides.splice(i, 1);
		this.guideEls.get(id)?.remove();
		this.guideEls.delete(id);
		if (this.selectedId === id) this.selectedId = null;
		this.scheduleDraw(axis);
		this.commit();
	}

	clearGuides() {
		for (const el of this.guideEls.values()) el.remove();
		this.guideEls.clear();
		this.guides = [];
		this.selectedId = null;
		this.scheduleDraw();
		this.commit();
	}

	destroy() {
		if (!this.supported) return;
		window.removeEventListener("keydown", this.onKeyDown, true);
		this.disable();
		if (this.raf) cancelAnimationFrame(this.raf);
		clearTimeout(this.saveTimer);
		this.root.remove();
		releaseStyles();
	}

	// ------------------------------------------------------------------ dom

	private applyThemeVars() {
		const t = this.theme;
		this.root.style.setProperty("--rm-guide", t.guide);
		this.root.style.setProperty("--rm-active", t.guideActive);
		this.root.style.setProperty("--rm-ruler-bg", t.rulerBg);
		this.root.style.setProperty("--rm-ruler-border", t.rulerBorder);
	}

	private buildDom(zIndex: number) {
		const root = document.createElement("div");
		root.className = "rm-root";
		root.style.zIndex = String(zIndex);
		root.style.display = "none";

		const guidesLayer = document.createElement("div");
		guidesLayer.className = "rm-guides";

		const top = document.createElement("canvas");
		const left = document.createElement("canvas");
		top.className = "rm-ruler";
		left.className = "rm-ruler";
		// Top ruler spawns horizontal guides, left ruler spawns vertical guides.
		top.addEventListener("pointerdown", (e) => {
			if (e.button === 0)
				this.beginDrag(e, this.insertGuide("y", Math.round(e.clientY)));
		});
		left.addEventListener("pointerdown", (e) => {
			if (e.button === 0)
				this.beginDrag(e, this.insertGuide("x", Math.round(e.clientX)));
		});

		const corner = document.createElement("div");
		corner.className = "rm-corner";

		const badge = document.createElement("div");
		badge.className = "rm-badge";

		root.append(guidesLayer, top, left, corner, badge);
		document.body.appendChild(root);

		this.root = root;
		this.topCanvas = top;
		this.leftCanvas = left;
		this.guidesLayer = guidesLayer;
		this.badge = badge;
	}

	private insertGuide(axis: GuideAxis, pos: number): Guide {
		const guide: Guide = { id: this.nextId++, axis, pos };
		this.guides.push(guide);
		this.mountGuide(guide);
		this.scheduleDraw(axis);
		return guide;
	}

	private mountGuide(g: Guide) {
		const el = document.createElement("div");
		el.className = "rm-guide";
		el.dataset.axis = g.axis;
		el.addEventListener("pointerdown", (e) => {
			if (e.button !== 0) return;
			const current = this.guides.find((x) => x.id === g.id);
			if (!current) return;
			// Alt-drag duplicates the guide (Figma behavior); the copy follows the cursor.
			const target = e.altKey
				? this.insertGuide(current.axis, current.pos)
				: current;
			this.beginDrag(e, target);
		});
		el.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			this.removeGuide(g.id);
		});
		el.addEventListener("pointermove", (e) => {
			if (!this.dragging) this.moveBadge(e.clientX, e.clientY, g.pos);
		});
		el.addEventListener("pointerleave", () => {
			if (!this.dragging) this.hideBadge();
		});
		this.guidesLayer.appendChild(el);
		this.guideEls.set(g.id, el);
		this.positionEl(g);
	}

	private positionEl(g: Guide) {
		const el = this.guideEls.get(g.id);
		if (!el) return;
		el.style.transform =
			g.axis === "x"
				? `translate3d(${g.pos - HIT}px,0,0)`
				: `translate3d(0,${g.pos - HIT}px,0)`;
	}

	// ----------------------------------------------------------- interaction

	private beginDrag(e: PointerEvent, guide: Guide) {
		e.preventDefault();
		e.stopPropagation();
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		this.dragging = true;
		this.select(guide.id);
		this.prevCursor = document.documentElement.style.cursor;
		document.documentElement.style.cursor =
			guide.axis === "x" ? "ew-resize" : "ns-resize";
		this.moveBadge(e.clientX, e.clientY, guide.pos);

		const onMove = (ev: PointerEvent) => {
			const pos = Math.round(guide.axis === "x" ? ev.clientX : ev.clientY);
			if (pos !== guide.pos) {
				guide.pos = pos;
				this.positionEl(guide);
				this.scheduleDraw(guide.axis);
			}
			this.moveBadge(ev.clientX, ev.clientY, pos);
		};
		const onEnd = () => {
			target.removeEventListener("pointermove", onMove);
			target.removeEventListener("pointerup", onEnd);
			target.removeEventListener("pointercancel", onEnd);
			this.dragging = false;
			this.hideBadge();
			document.documentElement.style.cursor = this.prevCursor;
			const max = guide.axis === "x" ? window.innerWidth : window.innerHeight;
			// Dropping a guide back on its ruler (or off-screen) deletes it — Figma
			// behavior. A ruler click that never left the ruler is discarded too.
			if (guide.pos <= RULER || guide.pos >= max - 1)
				this.removeGuide(guide.id);
			else this.commit();
		};
		target.addEventListener("pointermove", onMove);
		target.addEventListener("pointerup", onEnd);
		target.addEventListener("pointercancel", onEnd);
	}

	private onKeyDown = (e: KeyboardEvent) => {
		// e.code is keyboard-layout independent; e.key covers virtual keyboards
		// and remaps that only report the character.
		const isR = e.code === "KeyR" || e.key.toLowerCase() === "r";
		if (isR && e.ctrlKey && e.shiftKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			this.setHidden(!this._hidden);
			return;
		}
		if (isTypingTarget(e.target)) return;
		// Figma's rulers shortcut — modifier-free, so no browser, OS remap, or
		// extension can claim it before the page sees it.
		if (isR && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			this.toggle();
			return;
		}
		if (!this._enabled || this._hidden) return;
		if (this.selectedId == null) return;
		const g = this.guides.find((x) => x.id === this.selectedId);
		if (!g) return;
		if (e.key === "Delete" || e.key === "Backspace") {
			e.preventDefault();
			this.removeGuide(g.id);
			return;
		}
		if (e.key === "Escape") {
			this.select(null);
			return;
		}
		const step = e.shiftKey ? 10 : 1;
		let delta = 0;
		if (g.axis === "x" && e.key === "ArrowLeft") delta = -step;
		else if (g.axis === "x" && e.key === "ArrowRight") delta = step;
		else if (g.axis === "y" && e.key === "ArrowUp") delta = -step;
		else if (g.axis === "y" && e.key === "ArrowDown") delta = step;
		if (delta !== 0) {
			e.preventDefault();
			const max = g.axis === "x" ? window.innerWidth : window.innerHeight;
			g.pos = clamp(g.pos + delta, RULER + 1, max - 2);
			this.positionEl(g);
			this.scheduleDraw(g.axis);
			this.commit();
		}
	};

	private onDocPointerDown = (e: PointerEvent) => {
		if (e.target instanceof Node && this.root.contains(e.target)) return;
		this.select(null);
	};

	private onResize = () => this.scheduleDraw();

	private select(id: number | null) {
		if (this.selectedId === id) return;
		this.selectedId = id;
		for (const [gid, el] of this.guideEls)
			el.toggleAttribute("data-selected", gid === id);
		this.scheduleDraw();
	}

	// ---------------------------------------------------------------- badge

	private moveBadge(x: number, y: number, value: number) {
		const b = this.badge;
		if (b.style.display !== "block") b.style.display = "block";
		const text = String(value);
		if (b.textContent !== text) b.textContent = text;
		const bx = clamp(x + 12, RULER + 2, window.innerWidth - 52);
		const by = clamp(y + 16, RULER + 2, window.innerHeight - 26);
		b.style.transform = `translate3d(${bx}px,${by}px,0)`;
	}

	private hideBadge() {
		this.badge.style.display = "none";
	}

	// -------------------------------------------------------------- drawing

	/**
	 * rAF-coalesced repaint. Pass the axis whose ruler changed (a guide drag
	 * only dirties its perpendicular ruler); omit to repaint both.
	 */
	private scheduleDraw(axis?: GuideAxis) {
		if (axis !== "y") this.dirtyX = true;
		if (axis !== "x") this.dirtyY = true;
		if (!this._enabled || this._hidden || this.raf) return;
		this.raf = requestAnimationFrame(() => {
			this.raf = 0;
			if (this.dirtyX) this.drawRuler("x");
			if (this.dirtyY) this.drawRuler("y");
			this.dirtyX = false;
			this.dirtyY = false;
		});
	}

	private drawRulers() {
		this.dirtyX = false;
		this.dirtyY = false;
		this.drawRuler("x");
		this.drawRuler("y");
	}

	/**
	 * axis "x" draws the top ruler (it measures the x axis and carries markers
	 * for vertical guides); axis "y" draws the left ruler.
	 */
	private drawRuler(axis: GuideAxis) {
		const t = this.theme;
		const horizontal = axis === "x";
		const canvas = horizontal ? this.topCanvas : this.leftCanvas;
		const len = horizontal ? window.innerWidth : window.innerHeight;
		const dpr = window.devicePixelRatio || 1;
		const w = horizontal ? len : RULER;
		const h = horizontal ? RULER : len;
		const bw = Math.max(1, Math.round(w * dpr));
		const bh = Math.max(1, Math.round(h * dpr));
		if (canvas.width !== bw || canvas.height !== bh) {
			canvas.width = bw;
			canvas.height = bh;
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = t.rulerBg;
		ctx.fillRect(0, 0, w, h);

		ctx.lineWidth = 1;
		ctx.strokeStyle = t.rulerBorder;
		ctx.beginPath();
		if (horizontal) {
			ctx.moveTo(0, RULER - 0.5);
			ctx.lineTo(w, RULER - 0.5);
		} else {
			ctx.moveTo(RULER - 0.5, 0);
			ctx.lineTo(RULER - 0.5, h);
		}
		ctx.stroke();

		// Ticks: minor every 10px, medium every 50px, major (labeled) every 100px.
		ctx.strokeStyle = t.tick;
		ctx.beginPath();
		for (let p = 0; p <= len; p += 10) {
			const size = p % 100 === 0 ? 7 : p % 50 === 0 ? 5 : 3;
			const at = p + 0.5;
			if (horizontal) {
				ctx.moveTo(at, RULER - size);
				ctx.lineTo(at, RULER);
			} else {
				ctx.moveTo(RULER - size, at);
				ctx.lineTo(RULER, at);
			}
		}
		ctx.stroke();

		ctx.font = t.labelFont;
		ctx.fillStyle = t.tickLabel;
		for (let p = 100; p <= len; p += 100) {
			const text = String(p);
			if (horizontal) {
				ctx.fillText(text, p + 4, 9);
			} else {
				// Left-ruler labels read bottom-to-top, like Figma.
				ctx.save();
				ctx.translate(9, p - 4);
				ctx.rotate(-Math.PI / 2);
				ctx.fillText(text, 0, 0);
				ctx.restore();
			}
		}

		// Guide markers: a colored line across the ruler + the px value.
		for (const g of this.guides) {
			if (g.axis !== axis || g.pos < 0 || g.pos > len) continue;
			const color = g.id === this.selectedId ? t.guideActive : t.guide;
			ctx.strokeStyle = color;
			ctx.beginPath();
			const at = g.pos + 0.5;
			if (horizontal) {
				ctx.moveTo(at, 0);
				ctx.lineTo(at, RULER);
			} else {
				ctx.moveTo(0, at);
				ctx.lineTo(RULER, at);
			}
			ctx.stroke();

			const text = String(g.pos);
			const tw = ctx.measureText(text).width;
			if (horizontal) {
				const lx = g.pos - tw - 5 > RULER ? g.pos - tw - 5 : g.pos + 5;
				ctx.fillStyle = t.rulerBg;
				ctx.fillRect(lx - 2, 1, tw + 4, 11);
				ctx.fillStyle = color;
				ctx.fillText(text, lx, 9);
			} else {
				const flip = g.pos - tw - 5 <= RULER;
				ctx.save();
				ctx.translate(9, flip ? g.pos + 5 + tw : g.pos - 5);
				ctx.rotate(-Math.PI / 2);
				ctx.fillStyle = t.rulerBg;
				ctx.fillRect(-2, -8, tw + 4, 11);
				ctx.fillStyle = color;
				ctx.fillText(text, 0, 0);
				ctx.restore();
			}
		}
	}

	// -------------------------------------------------------------- persist

	private commit() {
		if (this.storageKey) {
			clearTimeout(this.saveTimer);
			this.saveTimer = setTimeout(() => {
				try {
					localStorage.setItem(
						this.storageKey as string,
						JSON.stringify({
							v: 1,
							guides: this.guides.map((g) => ({ a: g.axis, p: g.pos })),
						}),
					);
				} catch {
					// storage unavailable (private mode, quota) — guides stay in-memory
				}
			}, 150);
		}
		this.emit();
	}

	private loadGuides() {
		if (!this.storageKey) return;
		try {
			const raw = localStorage.getItem(this.storageKey);
			if (!raw) return;
			const data = JSON.parse(raw) as {
				v: number;
				guides: { a: GuideAxis; p: number }[];
			};
			if (data.v !== 1 || !Array.isArray(data.guides)) return;
			for (const g of data.guides) {
				if ((g.a === "x" || g.a === "y") && typeof g.p === "number")
					this.insertGuide(g.a, Math.round(g.p));
			}
		} catch {
			// corrupt payload — start with no guides
		}
	}

	private emit() {
		this.onChange?.(this);
	}
}
