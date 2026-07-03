// template.tsx remounts on every route change in Next.js App Router.
// Used here for scroll-position reset on navigation; page enter/exit
// animations are handled by AnimationProvider in layout.tsx.
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
