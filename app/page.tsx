// The real work-page content is rendered by the root layout's persistent
// shell (see components/PersistentWorkShell.tsx) so it never unmounts across
// navigation. This route intentionally renders nothing.
export default function Home() {
  return null;
}
