import { useState, useEffect } from "react";
import ApiSettings from "./components/ApiSettings";
import NewChatDialog from "./components/NewChatDialog";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import Navigation from "./components/Navigation";
import SettingsSidebar from "./components/SettingsSidebar";
import type { Chat, OutgoingMessage, View } from "./types";
import "./App.css";

const STORAGE_KEY_CHATS = "greenapi_chats";
const STORAGE_KEY_MESSAGES = "greenapi_messages";

export default function App() {
  const [activeView, setActiveView] = useState<View>("chats");
  const [activeSetting, setActiveSetting] = useState("api");
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHATS);
    if (!saved) return [];
    return JSON.parse(saved).map((c: any) => ({
      id: c.id || c.chatId,
      name: c.name,
      type: c.type,
      lastMessage: c.lastMessage,
    }));
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, OutgoingMessage[]>
  >(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!saved) return {};
    const parsed = JSON.parse(saved) as Record<string, any[]>;
    const result: Record<string, OutgoingMessage[]> = {};
    for (const chatId of Object.keys(parsed)) {
      result[chatId] = parsed[chatId].map((m: any) => ({
        id: m.id || m.messageId,
        chatId: m.chatId,
        type: m.type,
        timestamp: m.timestamp,
        status: m.status,
        body: m.body,
      }));
    }
    return result;
  });

  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesByChat));
  }, [messagesByChat]);

  const outgoingMessages = activeChatId
    ? messagesByChat[activeChatId] || []
    : [];

  const handleNewChat = (phone: string) => {
    const id = `${phone}@c.us`;
    const newChat: Chat = {
      id,
      name: phone,
      type: "remote",
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
  };

  const getChatName = () => {
    if (!activeChatId) return "";
    const chat = chats.find((c) => c.id === activeChatId);
    return chat?.name || activeChatId;
  };

  const handleSend = (message: string) => {
    if (!activeChatId) return;
    const newMessage: OutgoingMessage = {
      id: Date.now(),
      chatId: activeChatId,
      type: "message",
      timestamp: Math.floor(Date.now() / 1000),
      status: "sent",
      body: message,
    };
    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage],
    }));
  };

  return (
    <div className="app">
      <Navigation activeView={activeView} onChangeView={setActiveView} />

      {activeView === "chats" ? (
        <>
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelect={setActiveChatId}
            onCreateNew={() => setShowNewChat(true)}
          />
          {activeChatId ? (
            <ChatWindow
              chatName={getChatName()}
              outgoingMessages={outgoingMessages}
              onSend={handleSend}
            />
          ) : (
            <div className="no-chat-selected">
              <p>Выберите чат или создайте новый</p>
            </div>
          )}
        </>
      ) : (
        <>
          <SettingsSidebar
            activeSetting={activeSetting}
            onSelect={setActiveSetting}
          />
          <ApiSettings activeSetting={activeSetting} />
        </>
      )}

      <NewChatDialog
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreate={handleNewChat}
      />
    </div>
  );
}
