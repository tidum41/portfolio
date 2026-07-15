import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";

// Playground Gallery is a singleton (one document, fixed ID "playgroundGallery" —
// see scripts/seed-playground-gallery.mjs) so its list item opens straight into
// that document instead of a document-type list. Case studies keep the default
// list view since there are multiple. Both get their own labeled top-level
// section instead of Sanity's flat auto-generated document-type list.
const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Case Studies")
        .child(S.documentTypeList("caseStudy").title("Case Studies")),
      S.listItem()
        .title("Playground Gallery")
        .child(
          S.document()
            .schemaType("playgroundGallery")
            .documentId("playgroundGallery")
        ),
    ]);

export default defineConfig({
  title: "Mudit Mahajan — Studio",
  basePath: "/studio",

  projectId: "9vl5qk61",
  dataset:   "production",

  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
