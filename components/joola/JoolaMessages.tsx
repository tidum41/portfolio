"use client";

import { useEffect, useState } from "react";
import JoolaStage from "./JoolaStage";
import { JOOLA_MESSAGES } from "@/lib/caseStudies/joolaLedger";

const LOOP_MS = 6000;
const REPLY_AT_MS = 1800;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function MessagesInner({ replayKey = 0 }: { replayKey?: number }) {
  const reduced = usePrefersReducedMotion();
  const [showReply, setShowReply] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setShowReply(true);
      return;
    }
    let replyTimer = 0;
    const runCycle = () => {
      setShowReply(false);
      replyTimer = window.setTimeout(() => setShowReply(true), REPLY_AT_MS);
    };
    runCycle();
    const interval = window.setInterval(runCycle, LOOP_MS);
    return () => {
      window.clearTimeout(replyTimer);
      window.clearInterval(interval);
    };
  }, [reduced, replayKey]);

  return (
    <div className="msg-demo">
      <div className="thread" aria-live="polite">
        <div className="thread-head">
          JOOLA Sales
          <span className="th-role">Any JOOLA rep can reply</span>
        </div>
        <div className="thread-body">
          <div className="bubble anna">
            <div className="who">
              <b>Anna Bright</b>
              <span>Buyer · {JOOLA_MESSAGES.annaTime}</span>
              <span className="sent-check">Sent</span>
            </div>
            {JOOLA_MESSAGES.anna}
          </div>
          {showReply ? (
            <div className={`bubble sam${reduced ? "" : " is-entering"}`}>
              <div className="who">
                <b>Sam Ortiz</b>
                <span>JOOLA Sales · {JOOLA_MESSAGES.samTime}</span>
              </div>
              {JOOLA_MESSAGES.sam}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function JoolaMessages({ caption }: { caption?: string }) {
  return (
    <JoolaStage caption={caption} label="Messages thread with JOOLA Sales">
      <MessagesInner />
    </JoolaStage>
  );
}

export { MessagesInner };
