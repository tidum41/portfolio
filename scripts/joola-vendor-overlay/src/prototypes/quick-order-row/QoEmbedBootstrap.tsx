import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { setDevConfig, type ScreenKey } from "../../api/mock";
import { setPaused } from "../../api/clock";
import { useStore } from "../../state/Store";

/** Session + dev config for QO embed app (mirrors EmbedBootstrap buyer path). */
export function QoEmbedBootstrap() {
  const [params] = useSearchParams();
  const { session, bootstrapSession, switchAccount } = useStore();

  useEffect(() => {
    if (params.get("embed") !== "1") return;
    setDevConfig({
      view: "portal",
      screen: "quick-order" as ScreenKey,
      state: "default",
      accountId: "dicks",
      latencyMs: 0,
      failureRate: 0,
    });
    setPaused(false);
  }, [params]);

  useEffect(() => {
    if (params.get("embed") !== "1") return;
    const roleOk = session?.role === "buyer";
    if (!roleOk) {
      bootstrapSession("maya.okonkwo@dicks.com", false);
      switchAccount("dicks");
    } else if (session.accountId !== "dicks") {
      switchAccount("dicks");
    }
  }, [params, session, bootstrapSession, switchAccount]);

  return null;
}
