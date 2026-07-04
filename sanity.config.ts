import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  title: "Mudit Mahajan — Studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "replace-me",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production",

  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
