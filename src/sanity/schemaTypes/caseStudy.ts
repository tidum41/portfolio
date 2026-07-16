import { defineField, defineType } from "sanity";

// Reusable phone-mockup positioning object
const phonePos = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsed: true, collapsible: true },
    fields: [
      defineField({ name: "videoX",       type: "number", title: "Video X offset (%)",   initialValue: 0 }),
      defineField({ name: "videoY",       type: "number", title: "Video Y offset (%)",   initialValue: 0 }),
      defineField({ name: "videoScale",   type: "number", title: "Video scale",          initialValue: 1 }),
      defineField({ name: "insetTop",     type: "number", title: "Screen inset top (%)", initialValue: 1.5 }),
      defineField({ name: "insetBottom",  type: "number", title: "Screen inset bottom (%)", initialValue: 1.5 }),
      defineField({ name: "insetSide",    type: "number", title: "Screen inset side (%)", initialValue: 4 }),
      defineField({ name: "screenRadius", type: "number", title: "Screen corner radius (%)", initialValue: 7.5 }),
    ],
  });

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  groups: [
    { name: "hero",       title: "Hero" },
    { name: "problem",    title: "Problem" },
    { name: "research",   title: "Research" },
    { name: "process",    title: "Process" },
    { name: "decision1",  title: "Decision 1", hidden: ({ document }: { document?: Record<string, unknown> }) => document?.pageType !== "product-design" },
    { name: "decision2",  title: "Decision 2", hidden: ({ document }: { document?: Record<string, unknown> }) => document?.pageType !== "product-design" },
    { name: "decision3",  title: "Decision 3", hidden: ({ document }: { document?: Record<string, unknown> }) => document?.pageType !== "product-design" },
    { name: "decision4",  title: "Decision 4", hidden: ({ document }: { document?: Record<string, unknown> }) => document?.pageType !== "product-design" },
    { name: "solution",   title: "Solution" },
    { name: "impact",     title: "Impact" },
    { name: "reflection", title: "Reflection", hidden: ({ document }: { document?: Record<string, unknown> }) => document?.pageType !== "product-design" },
    { name: "toc",        title: "TOC / Meta" },
  ],
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    defineField({ name: "title", type: "string", title: "Title", group: "toc" }),
    defineField({ name: "slug",  type: "string", title: "Slug (e.g. ucla-sublease)", group: "toc" }),

    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      group: "toc",
      options: {
        list: [
          { title: "Product Design", value: "product-design" },
          { title: "YouTube / Personal", value: "youtube-channel" },
        ],
      },
      initialValue: "product-design",
    }),

    defineField({
      name: "tocItems", title: "TOC items", type: "array", group: "toc",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "id",    type: "string", title: "Section ID" }),
          defineField({ name: "label", type: "string", title: "Label" }),
        ],
        preview: { select: { title: "label", subtitle: "id" } },
      }],
    }),

    // ── Hero ────────────────────────────────────────────────────────────────
    defineField({ name: "heroTagline", type: "string", title: "Tagline (eyebrow text)", group: "hero" }),
    defineField({ name: "heroTitle",   type: "string", title: "Hero title",             group: "hero" }),
    defineField({ name: "heroBg",      type: "string", title: "Hero background color (CSS value)", group: "hero" }),
    defineField({ name: "heroMuxId",   type: "string", title: "Hero Mux Playback ID",   group: "hero" }),
    defineField({ name: "heroImage",   type: "image",  title: "Hero image (static, used instead of Mux video when set)", group: "hero", options: { hotspot: true } }),
    phonePos("heroPhonePos", "Hero phone positioning"),

    defineField({
      name: "metadata", title: "Metadata columns", type: "array", group: "hero",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label",  type: "string", title: "Label" }),
          defineField({ name: "values", type: "array", title: "Values", of: [{ type: "string" }] }),
        ],
        preview: { select: { title: "label" } },
      }],
    }),

    // ── Problem ─────────────────────────────────────────────────────────────
    defineField({ name: "problemLabel",        type: "string", title: "Section label",    group: "problem" }),
    defineField({ name: "problemHeading",      type: "string", title: "Heading",          group: "problem" }),
    defineField({ name: "problemBody",         type: "text",   title: "Body text",        group: "problem" }),
    defineField({ name: "problemImageCaption", type: "string", title: "Image caption",    group: "problem" }),
    defineField({ name: "problemImage",        type: "image",  title: "Problem image",    group: "problem", options: { hotspot: true } }),
    defineField({
      name: "painPoints", type: "array", title: "Pain points", group: "problem",
      of: [{ type: "string" }],
    }),

    // ── Research ────────────────────────────────────────────────────────────
    defineField({ name: "researchLabel",   type: "string", title: "Section label", group: "research" }),
    defineField({ name: "researchHeading", type: "string", title: "Heading",       group: "research" }),
    defineField({ name: "researchBody",    type: "text",   title: "Body text",     group: "research" }),
    defineField({
      name: "stats", type: "array", title: "Stats", group: "research",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "value", type: "string", title: "Value (e.g. 75%)" }),
          defineField({ name: "label", type: "string", title: "Label" }),
        ],
        preview: { select: { title: "value", subtitle: "label" } },
      }],
    }),

    // ── Process ─────────────────────────────────────────────────────────────
    defineField({ name: "processLabel",   type: "string", title: "Section label", group: "process" }),
    defineField({ name: "processHeading", type: "string", title: "Heading",       group: "process" }),
    defineField({ name: "processBody",    type: "text",   title: "Body text",     group: "process" }),
    defineField({
      name: "processTools", type: "array", title: "Tools used", group: "process",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "tool", type: "string", title: "Tool name" }),
          defineField({ name: "desc", type: "string", title: "Description" }),
        ],
        preview: { select: { title: "tool", subtitle: "desc" } },
      }],
    }),
    defineField({ name: "figmaComparison", type: "image", title: "Figma comparison image", group: "process", options: { hotspot: true } }),
    defineField({ name: "processImage",    type: "image", title: "Process image",           group: "process", options: { hotspot: true } }),

    // ── Decision 1 ──────────────────────────────────────────────────────────
    defineField({ name: "d1Label",   type: "string", title: "Section label", group: "decision1" }),
    defineField({ name: "d1Heading", type: "string", title: "Heading",       group: "decision1" }),
    defineField({ name: "d1Body",    type: "text",   title: "Body text",     group: "decision1" }),
    defineField({ name: "decision1CardInitial",   type: "image", title: "Card — initial",   group: "decision1", options: { hotspot: true } }),
    defineField({ name: "decision1CardCondensed", type: "image", title: "Card — condensed", group: "decision1", options: { hotspot: true } }),
    defineField({ name: "decision1CardFinal",     type: "image", title: "Card — final",     group: "decision1", options: { hotspot: true } }),
    defineField({
      name: "d1CardLabels", type: "array", title: "Card labels (initial, condensed, final)", group: "decision1",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "d1CompCol1", type: "array", title: "Comparison col 1 (initial)", group: "decision1",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "type", type: "string", title: "Type", options: { list: ["right", "wrong", "neutral"] } }),
          defineField({ name: "text", type: "string", title: "Text" }),
        ],
        preview: { select: { title: "text", subtitle: "type" } },
      }],
    }),
    defineField({
      name: "d1CompCol2", type: "array", title: "Comparison col 2 (condensed)", group: "decision1",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "type", type: "string", title: "Type", options: { list: ["right", "wrong", "neutral"] } }),
          defineField({ name: "text", type: "string", title: "Text" }),
        ],
        preview: { select: { title: "text", subtitle: "type" } },
      }],
    }),
    defineField({
      name: "d1CompCol3", type: "array", title: "Comparison col 3 (final)", group: "decision1",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "type", type: "string", title: "Type", options: { list: ["right", "wrong", "neutral"] } }),
          defineField({ name: "text", type: "string", title: "Text" }),
        ],
        preview: { select: { title: "text", subtitle: "type" } },
      }],
    }),
    defineField({
      name: "d1Insights", type: "array", title: "Research insights", group: "decision1",
      of: [{ type: "string" }],
    }),

    // ── Decision 2 ──────────────────────────────────────────────────────────
    defineField({ name: "d2Label",       type: "string", title: "Section label", group: "decision2" }),
    defineField({ name: "d2Heading",     type: "string", title: "Heading",       group: "decision2" }),
    defineField({ name: "d2Body",        type: "text",   title: "Body text",     group: "decision2" }),
    defineField({ name: "ueTestingVideo", type: "file",   title: "UE testing video", group: "decision2", options: { accept: "video/*" } }),
    phonePos("d2PhonePos", "Decision 2 phone positioning"),

    // ── Decision 3 ──────────────────────────────────────────────────────────
    defineField({ name: "d3Label",       type: "string", title: "Section label",    group: "decision3" }),
    defineField({ name: "d3Heading",     type: "string", title: "Heading",          group: "decision3" }),
    defineField({ name: "d3Body",        type: "text",   title: "Body text",        group: "decision3" }),
    defineField({ name: "oldFlowVideo",  type: "file",   title: "Before video",     group: "decision3", options: { accept: "video/*" } }),
    defineField({ name: "decision1Video",type: "file",   title: "After video",      group: "decision3", options: { accept: "video/*" } }),
    phonePos("d3BeforePhonePos", "Decision 3 'before' phone positioning"),
    phonePos("d3AfterPhonePos",  "Decision 3 'after' phone positioning"),

    // ── Decision 4 ──────────────────────────────────────────────────────────
    defineField({ name: "d4Label",           type: "string", title: "Section label",       group: "decision4" }),
    defineField({ name: "d4Heading",         type: "string", title: "Heading",             group: "decision4" }),
    defineField({ name: "d4Body",            type: "text",   title: "Body text",           group: "decision4" }),
    defineField({ name: "homepageComparison",type: "image",  title: "Homepage comparison image", group: "decision4", options: { hotspot: true } }),

    // ── Solution ────────────────────────────────────────────────────────────
    defineField({ name: "solutionLabel",   type: "string", title: "Section label", group: "solution" }),
    defineField({ name: "solutionHeading", type: "string", title: "Heading",       group: "solution" }),
    defineField({ name: "solutionBody",    type: "text",   title: "Body text",     group: "solution" }),
    defineField({ name: "solutionBg",      type: "string", title: "Background color (CSS value)", group: "solution" }),
    defineField({ name: "solutionMuxId",   type: "string", title: "Solution Mux Playback ID", group: "solution" }),
    defineField({ name: "solutionVideo",   type: "file",   title: "Solution video (local file, no caption)", group: "solution", options: { accept: "video/*" } }),
    phonePos("solutionPhonePos", "Solution phone positioning"),

    // ── Impact ──────────────────────────────────────────────────────────────
    defineField({ name: "impactLabel",   type: "string", title: "Section label", group: "impact" }),
    defineField({ name: "impactHeading", type: "string", title: "Heading",       group: "impact" }),
    defineField({ name: "impactBody",    type: "text",   title: "Body text (blank line between paragraphs)", group: "impact" }),

    // ── Reflection ──────────────────────────────────────────────────────────
    defineField({ name: "reflectionLabel", type: "string", title: "Section label", group: "reflection" }),
    defineField({
      name: "reflectionItems", type: "array", title: "Reflection items", group: "reflection",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "heading", type: "string", title: "Heading" }),
          defineField({ name: "body",    type: "text",   title: "Body" }),
        ],
        preview: { select: { title: "heading" } },
      }],
    }),
  ],
  preview: { select: { title: "title" } },
});
