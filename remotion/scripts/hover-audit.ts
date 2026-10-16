import { clickReport, hoverAudit } from "../src/joola/pointer";

console.log(JSON.stringify({ hover: hoverAudit(), clicks: clickReport() }));
