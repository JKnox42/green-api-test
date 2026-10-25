export default function MessageBubble({
  text,
  timestamp,
  isOutgoing,
}: {
  text: string;
  timestamp: number;
  isOutgoing: boolean;
}) {
  const time = new Date(timestamp * 1000).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message ${isOutgoing ? "outgoing" : "incoming"}`}>
      <div className="message-bubble">
        <p>{text}</p>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}
