"use client";

import { Agentation } from "agentation";

/**
 * Preview/dev-only toolbar host. Imported only through AgentationSlot's
 * production-dead branch so production client bundles never see this module.
 */
export default function AgentationMount() {
  return (
    <Agentation
      appName="muditm"
      identifyingAttributes={[
        "data-annotate",
        "data-testid",
        "data-test",
        "data-qa",
        "data-cy",
        "data-component",
      ]}
    />
  );
}
