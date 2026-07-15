"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Agentation } from "agentation";
import { DialRoot } from "dialkit";
import LayoutDials from "./LayoutDials";
import IntroDials from "./IntroDials";
import CaseStudyAlignDials from "./CaseStudyAlignDials";

export default function DevToolbar() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide if: embedded in iframe, or on the /dev route
    if (window.self !== window.top) return;
    if (pathname.startsWith("/dev")) return;
    setShow(true);
  }, [pathname]);

  if (!show) return null;
  return (
    <>
      <Agentation />
      <LayoutDials />
      <IntroDials />
      <CaseStudyAlignDials />
      <DialRoot defaultOpen={false} />
    </>
  );
}
