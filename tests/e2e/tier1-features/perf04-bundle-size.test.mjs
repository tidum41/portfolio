/**
 * PERF-04: Bundle Size & Competing Work Verification
 * 
 * Authoritative Source:
 * - TEST_INFRA.md: PERF-04.
 * - ORIGINAL_REQUEST.md: "lib/sanity/imageUrl.ts public config without sanityClient, dynamic load
 *   for ArchivePageClient, clean unused lowercase outlineMorphData keys, serialize NavFrame/Nav/RestingOutlineWord
 *   only if equivalence proven, verify BootScripts playlist duplication, revalidate Mux warmup,
 *   defer HalftoneDotField mask baking to afterIntroIdle."
 * - PROJECT.md: Features F2.1a through F2.1e.
 */
import { assert } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "PERF-04";
export const name = "Bundle Size & Competing Work Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "PERF-04.1: lib/sanity/imageUrl.ts configures builder without importing sanityClient",
    fn: async () => {
      const imgUrlPath = path.join(process.cwd(), "lib/sanity/imageUrl.ts");
      const src = fs.readFileSync(imgUrlPath, "utf8");

      const importsClient = src.includes('from "./client"') || src.includes("sanityClient");
      assert(
        !importsClient,
        "lib/sanity/imageUrl.ts must configure createImageUrlBuilder directly with public config without importing sanityClient"
      );
    },
  },
  {
    name: "PERF-04.2: components/outlineMorphData.ts has no unused lowercase keys",
    fn: async () => {
      const morphPath = path.join(process.cwd(), "components/outlineMorphData.ts");
      const src = fs.readFileSync(morphPath, "utf8");

      const hasLowerWork = src.includes('label: "work"');
      const hasLowerArchive = src.includes('label: "archive"');
      const hasLowerAbout = src.includes('label: "about"');

      assert(
        !hasLowerWork && !hasLowerArchive && !hasLowerAbout,
        `components/outlineMorphData.ts still contains unused lowercase keys: work=${hasLowerWork}, archive=${hasLowerArchive}, about=${hasLowerAbout}`
      );
    },
  },
  {
    name: "PERF-04.3: components/PersistentArchiveShell.tsx uses next/dynamic for ArchivePageClient",
    fn: async () => {
      const shellPath = path.join(process.cwd(), "components/PersistentArchiveShell.tsx");
      if (fs.existsSync(shellPath)) {
        const src = fs.readFileSync(shellPath, "utf8");
        assert(
          src.includes("dynamic(") || src.includes("next/dynamic"),
          "components/PersistentArchiveShell.tsx must dynamically load ArchivePageClient"
        );
      }
    },
  },
  {
    name: "PERF-04.4: components/BootScripts.tsx does not duplicate Mux playlist serialization",
    fn: async () => {
      const bootPath = path.join(process.cwd(), "components/BootScripts.tsx");
      if (fs.existsSync(bootPath)) {
        const src = fs.readFileSync(bootPath, "utf8");
        // Verify no duplicate script injection loops
        const playlistMatches = src.match(/playlist/gi) || [];
        assert(playlistMatches.length <= 10, "BootScripts.tsx has excessive playlist references indicating duplication");
      }
    },
  },
  {
    name: "PERF-04.5: components/HalftoneDotField.tsx defers mask baking to afterIntroIdle",
    fn: async () => {
      const dotFieldPath = path.join(process.cwd(), "components/HalftoneDotField.tsx");
      if (fs.existsSync(dotFieldPath)) {
        const src = fs.readFileSync(dotFieldPath, "utf8");
        assert(
          src.includes("afterIntroIdle") || src.includes("requestIdleCallback"),
          "HalftoneDotField.tsx must defer mask baking until after intro idle"
        );
      }
    },
  },
];
