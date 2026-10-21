type Props = { children: string };

export default function UserMessageBubble({ children }: Props) {
  return (
    <div className="dp-user-bubble">
      <p className="dp-text-body" style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
