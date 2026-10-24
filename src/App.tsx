import { useState, useEffect } from "react";
import axios from "axios";
import ApiSettings from "./components/ApiSettings";
import NewChatDialog from "./components/NewChatDialog";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import Navigation from "./components/Navigation";
import SettingsSidebar from "./components/SettingsSidebar";
import type { Chat, Message, View } from "./types";
import "./App.css";

const STORAGE_KEY_API = "greenapi_settings";
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
    Record<string, Message[]>
  >(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!saved) return {};
    return JSON.parse(saved) as Record<string, Message[]>;
  });

  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesByChat));
  }, [messagesByChat]);

  useEffect(() => {
    const settings = localStorage.getItem(STORAGE_KEY_API);
    if (!settings) return;
    const { idInstance, apiTokenInstance } = JSON.parse(settings);

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `https://api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
          { params: { receiveTimeout: 10 } },
        );

        const notification = response.data;
        if (!notification || !notification.body) return;

        axios
          .delete(
            `https://api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${notification.receiptId}`,
          )
          .catch(() => {});

        if (notification.body.typeWebhook !== "incomingMessageReceived") return;

        const body = notification.body;
        const chatId = body.senderData.chatId;
        const timestamp = body.timestamp;
        const messageText = body.messageData.textMessageData?.textMessage || "";

        const incomingMessage: Message = {
          id: Date.now(),
          chatId,
          type: "message",
          timestamp,
          status: "received",
          body: messageText,
          isOutgoing: false,
        };

        setMessagesByChat((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), incomingMessage],
        }));
      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const messages = activeChatId ? messagesByChat[activeChatId] || [] : [];

  const handleNewChat = async (phone: string) => {
    const settings = localStorage.getItem(STORAGE_KEY_API);
    if (!settings) {
      alert("Сначала настройте API в настройках");
      return;
    }
    const { idInstance, apiTokenInstance } = JSON.parse(settings);

    try {
      const res = await axios.post(
        `https://api.green-api.com/waInstance${idInstance}/checkAccount/${apiTokenInstance}`,
        { phoneNumber: Number(phone) },
      );
      if (!res.data.exist || !res.data.chatId) {
        alert("Получатель не найден");
        return;
      }
      const chatId = res.data.chatId;
      const newChat: Chat = {
        id: chatId,
        name: phone,
        type: "remote",
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(chatId);
    } catch {
      alert("Ошибка поиска получателя");
    }
  };

  const getChatName = () => {
    if (!activeChatId) return "";
    const chat = chats.find((c) => c.id === activeChatId);
    return chat?.name || activeChatId;
  };

  const handleSend = async (message: string) => {
    if (!activeChatId) return;

    const settings = localStorage.getItem(STORAGE_KEY_API);
    if (!settings) {
      alert("Сначала настройте API в настройках");
      return;
    }
    const { idInstance, apiTokenInstance } = JSON.parse(settings);

    try {
      await axios.post(
        `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        { chatId: activeChatId, message },
      );

      const newMessage: Message = {
        id: Date.now(),
        chatId: activeChatId,
        type: "message",
        timestamp: Math.floor(Date.now() / 1000),
        status: "sent",
        body: message,
        isOutgoing: true,
      };
      setMessagesByChat((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), newMessage],
      }));
    } catch {
      alert("Ошибка отправки сообщения");
    }
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
              messages={messages}
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
