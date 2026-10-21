/** Live app wordmark (`/images/logo.svg` on research.dialogueai.com). */
export default function DialogueWordmark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/dialogue/logo.svg"
      alt="dialogue"
      className={className}
      width={1000}
      height={230}
      decoding="sync"
    />
  );
}
