import { defineField, defineType } from "sanity";

// Maps to BentoGallery column span (wide/large → 2 cols; square/tall → 1).
// Tile height follows each image's natural aspect ratio from Sanity metadata.
const SHAPE_OPTIONS = [
  { title: "Square (1×1)", value: "square" },
  { title: "Tall (1×2)",   value: "tall" },
  { title: "Wide (2×1)",   value: "wide" },
  { title: "Large (2×2)",  value: "large" },
];

export const playgroundGallery = defineType({
  name: "playgroundGallery",
  title: "Archive Gallery",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Images",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "image", type: "image", title: "Image", options: { hotspot: true } }),
          defineField({ name: "caption", type: "string", title: "Caption" }),
          defineField({ name: "alt", type: "string", title: "Alt text (defaults to caption if blank)" }),
          defineField({ name: "link", type: "url", title: "Link (optional — shows a small clickable icon beside the caption)" }),
          defineField({ name: "shape", type: "string", title: "Shape", options: { list: SHAPE_OPTIONS }, initialValue: "square" }),
        ],
        preview: {
          select: { title: "caption", subtitle: "shape", media: "image" },
        },
      }],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Archive Gallery" }),
  },
});
