import type { MessageBubbleProps } from "../types";

export default function MessageBubble({
  text,
  timestamp,
  isOwn,
}: MessageBubbleProps) {
  const time = new Date(timestamp * 1000).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message ${isOwn ? "own" : "other"}`}>
      <div className="message-bubble">
        <p>{text}</p>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}
