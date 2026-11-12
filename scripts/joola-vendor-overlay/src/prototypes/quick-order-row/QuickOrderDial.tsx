import { useEffect, useMemo, useRef } from "react";
import { DialRoot, useDialKitController } from "dialkit";
import { useSearchParams } from "react-router-dom";
import { LINE_STATES, VARIANTS, parseLine, parseVariant } from "./logic";

function parseWidth(value: string | null) {
  return value === "1024" ? "1024" : "1280";
}

/**
 * DialKit controls for the quick-order row playground.
 * Sits beside the component so it never covers the row. URL stays the source
 * for screenshots and deep links: ?v= ?line= ?w=
 */
export function QuickOrderDial() {
  const [params, setParams] = useSearchParams();
  const applying = useRef(false);
  const last = useRef("");

  const initial = useMemo(
    () => ({
      variant: parseVariant(params.get("v")),
      line: parseLine(params.get("line")),
      width: parseWidth(params.get("w")),
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps -- seed once from the URL
  );

  const dial = useDialKitController(
    "Quick order",
    {
      variant: {
        _collapsed: false,
        variant: {
          type: "select",
          options: VARIANTS.map((item) => ({ value: item.id, label: item.label })),
          default: initial.variant,
        },
      },
      line: {
        _collapsed: false,
        state: {
          type: "select",
          options: LINE_STATES.map((item) => ({ value: item.id, label: item.label })),
          default: initial.line,
        },
      },
      frame: {
        _collapsed: false,
        width: {
          type: "select",
          options: [
            { value: "1024", label: "1024" },
            { value: "1280", label: "1280" },
          ],
          default: initial.width,
        },
      },
    },
    { id: "qo-line", defaultCollapsed: false },
  );

  const variant = String(dial.values.variant.variant);
  const line = String(dial.values.line.state);
  const width = String(dial.values.frame.width);

  useEffect(() => {
    if (applying.current) return;
    const next = new URLSearchParams(params);
    next.set("v", parseVariant(variant));
    next.set("line", parseLine(line));
    next.set("w", parseWidth(width));
    const qs = next.toString();
    if (qs === last.current) return;
    last.current = qs;
    setParams(next, { replace: true });
  }, [variant, line, width]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const qs = params.toString();
    if (qs === last.current) return;
    last.current = qs;
    applying.current = true;
    dial.setValues({
      variant: { variant: parseVariant(params.get("v")) },
      line: { state: parseLine(params.get("line")) },
      frame: { width: parseWidth(params.get("w")) },
    });
    queueMicrotask(() => {
      applying.current = false;
    });
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="qo-stage__kit" data-dialkit-ignore aria-label="Quick order controls">
      <DialRoot
        mode="inline"
        theme="light"
        defaultOpen
        productionEnabled
        versions="menu"
      />
    </aside>
  );
}
