// Studio layout — hides all site chrome so Sanity Studio renders full-screen.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* Hide site header/footer inside /studio */
        header.intro-hide, footer { display: none !important; }
        /* Restore default cursor — root layout forces cursor:none globally */
        * { cursor: auto !important; }
        /* Hide the skip-link */
        .skip-link { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
