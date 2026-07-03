import { defineField, defineType } from "sanity";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({ name: "title",      type: "string",  title: "Title" }),
    defineField({ name: "slug",       type: "slug",    title: "Slug", options: { source: "title" } }),
    defineField({ name: "breadcrumb", type: "string",  title: "Breadcrumb (e.g. Product Design | Case Study · 2026)" }),
    defineField({ name: "heroImage",  type: "image",   title: "Hero image", options: { hotspot: true } }),
    defineField({ name: "muxPlaybackId", type: "string", title: "Mux Playback ID (hero video)" }),
    defineField({
      name: "meta", title: "Metadata columns", type: "object",
      fields: [
        defineField({ name: "role",          type: "array", title: "Role",          of: [{ type: "string" }] }),
        defineField({ name: "timeline",      type: "string", title: "Timeline" }),
        defineField({ name: "tools",         type: "array", title: "Tools",         of: [{ type: "string" }] }),
        defineField({ name: "collaborators", type: "array", title: "Collaborators", of: [{ type: "string" }] }),
      ],
    }),
    defineField({
      name: "sections", title: "Sections", type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "id",    type: "string", title: "Section ID (for TOC)" }),
          defineField({ name: "label", type: "string", title: "TOC label" }),
          defineField({ name: "heading", type: "string", title: "Section heading" }),
          defineField({ name: "body",  type: "array",  title: "Body", of: [{ type: "block" }] }),
        ],
        preview: { select: { title: "label", subtitle: "heading" } },
      }],
    }),
    defineField({
      name: "reflection", title: "Reflection items", type: "array",
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
  preview: {
    select: { title: "title", media: "heroImage" },
  },
});
