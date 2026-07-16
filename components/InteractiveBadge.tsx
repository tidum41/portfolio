"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function InteractiveBadge() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ type: "spring", duration: reduced ? 0 : 0.35, bounce: 0 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "8px 12px",
        background: "var(--color-badge-bg)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        color: "var(--color-text-card-sub)",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={20} height={20} style={{ flexShrink: 0 }}>
        <path d="M64,76a52,52,0,0,1,104,0" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M72,224,42.68,174a20,20,0,0,1,34.64-20L96,184V76a20,20,0,0,1,40,0v56a20,20,0,0,1,40,0v16a20,20,0,0,1,40,0v36c0,24-8,40-8,40" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: 15,
        lineHeight: "18px",
        color: "var(--color-text-card-sub)",
        whiteSpace: "nowrap",
      }}>interactive</span>
    </motion.div>
  );
}
