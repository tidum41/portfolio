import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";

const appKind = import.meta.env.VITE_APP as "round5" | "qo";

async function mount() {
  const Root =
    appKind === "qo"
      ? (await import("./AppQo.tsx")).default
      : (await import("./AppEmbed.tsx")).default;

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}

mount();
