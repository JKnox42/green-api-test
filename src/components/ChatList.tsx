import type { Chat, ChatListProps } from "../types";

export default function ChatList({
  chats,
  activeChatId,
  onSelect,
  onCreateNew,
}: ChatListProps) {
  const formatLastMessage = (chat: Chat) => {
    if (!chat.lastMessage) return "";
    const time = new Date(chat.lastMessage.timestamp * 1000).toLocaleTimeString(
      "ru-RU",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
    return `${chat.lastMessage.senderName}: ${chat.lastMessage.body} • ${time}`;
  };

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
              <div className="chat-name">{chat.name}</div>
              <div className="chat-last">{formatLastMessage(chat)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
