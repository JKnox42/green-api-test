import type { Chat } from "../types";

export default function ChatList({
  chats,
  activeChatId,
  onSelect,
  onCreateNew,
}: {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}) {
  const formatTime = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Чаты</h2>
        <button className="btn-new-chat" onClick={onCreateNew}>
          +
        </button>
      </div>
      <div className="chat-items">
        {chats.length === 0 && <p className="empty-chats">Нет чатов</p>}
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChatId === chat.id ? "active" : ""}`}
            onClick={() => onSelect(chat.id)}
          >
            <div className="chat-avatar">{chat.name?.[0] || "?"}</div>
            <div className="chat-info">
              <div className="chat-name">
                {chat.name}
                {chat.lastMessage && (
                  <span className="chat-time">
                    {formatTime(chat.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              <div className="chat-last">{chat.lastMessage?.body || ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
