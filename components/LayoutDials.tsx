"use client";
import { useEffect } from "react";
import { useDialKit } from "dialkit";

export default function LayoutDials() {
  const dk = useDialKit("Layout", {
    pagePx: [24, 0, 80],
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--page-px", `${dk.pagePx}px`);
  }, [dk.pagePx]);

  return null;
}
