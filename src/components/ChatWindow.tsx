import { useState } from "react";
import MessageBubble from "./MessageBubble";
import type { ChatWindowProps } from "../types";

export default function ChatWindow({
  chatName,
  outgoingMessages,
  onSend,
}: ChatWindowProps) {
  const [text, setText] = useState("");

  const allMessages = outgoingMessages.map((m) => ({
    ...m,
    isOwn: true as const,
  }));

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{chatName}</h3>
      </div>
      <div className="messages">
        {allMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            text={msg.body}
            timestamp={msg.timestamp}
            isOwn={msg.isOwn}
          />
        ))}
      </div>
      <div className="message-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Введите сообщение..."
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </div>
  );
}
