"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface PortfolioCardProps {
  slug: string;
  href?: string;
  title: string;
  category?: string;
  /** Renders as a colour-block card */
  colorBg?: string;
  colorContent?: React.ReactNode;
  /** Aspect ratio of the image/card area */
  aspectRatio?: string;
  /** Placeholder bg colour while image loads / when no real image */
  imageBg?: string;
  /** Real image path — renders next/image when provided */
  imageSrc?: string;
  imageAlt?: string;
  isExternal?: boolean;
  prefetch?: boolean;
}

export default function PortfolioCard({
  slug,
  href,
  title,
  category,
  colorBg,
  colorContent,
  aspectRatio = "4/3",
  imageBg = "var(--color-border)",
  imageSrc,
  imageAlt,
  isExternal = false,
  prefetch = false,
}: PortfolioCardProps) {
  const cardContent = (
    <motion.article
      key={slug}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      style={{ originX: 0.5, originY: 0.5 }}
      className={[
        "group flex flex-col gap-2",
        href ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      {/* Image / colour block */}
      <div
        className="w-full rounded-lg overflow-hidden shadow-card group-hover:shadow-card-hover transition-shadow duration-220 ease-out-expo relative"
        style={{ aspectRatio, background: colorBg ?? imageBg }}
      >
        {/* Real image */}
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-[220ms] ease-out-expo project-image"
          />
        )}

        {/* Colour-block content (logo, mockup, etc.) */}
        {!imageSrc && colorContent && (
          <div className="w-full h-full flex items-center justify-center">
            {colorContent}
          </div>
        )}
      </div>

      {/* Caption */}
      {(title || category) && (
        <div className="flex flex-col gap-1 px-0">
          {title && (
            <span className="text-sm text-muted leading-snug">{title}</span>
          )}
          {category && (
            <span className="label-caps">{category}</span>
          )}
        </div>
      )}
    </motion.article>
  );

  if (!href) return cardContent;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        tabIndex={0}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={href} prefetch={prefetch} className="block" tabIndex={0}>
      {cardContent}
    </Link>
  );
}
