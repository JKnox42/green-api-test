import { useState, useEffect, useRef } from "react";
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

function getSettings() {
  const saved = localStorage.getItem(STORAGE_KEY_API);
  if (!saved) return null;
  return JSON.parse(saved);
}

function updateLastMessage(
  chatId: string,
  body: string,
  timestamp: number,
  senderName: string,
) {
  return (prev: Chat[]) =>
    prev.map((c) =>
      c.id === chatId
        ? { ...c, lastMessage: { body, timestamp, senderName } }
        : c,
    );
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("chats");
  const [activeSetting, setActiveSetting] = useState("api");
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHATS);
    if (!saved) return [];
    return JSON.parse(saved).map((c: any) => ({
      id: c.id,
      maxId: c.maxId,
      name: c.name,
      type: c.type,
      lastMessage: c.lastMessage,
    }));
  });
  const chatsRef = useRef(chats);
  chatsRef.current = chats;

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, Message[]>
  >(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!saved) return {};
    return JSON.parse(saved) as Record<string, Message[]>;
  });
  const messagesByChatRef = useRef(messagesByChat);
  const processedReceiptIds = useRef<Set<number>>(new Set());

  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => {
        processedReceiptIds.current.clear();
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesByChatRef.current = messagesByChat;
  }, [messagesByChat]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesByChat));
  }, [messagesByChat]);

  useEffect(() => {
    const settings = getSettings();
    if (!settings) return;
    const { idInstance, apiTokenInstance } = settings;

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

        const receiptId = notification.receiptId;
        if (processedReceiptIds.current.has(receiptId)) return;
        processedReceiptIds.current.add(receiptId);

        const body = notification.body;
        const maxId = body.senderData.chatId;
        const phone = body.senderData.senderPhoneNumber;
        const id = `${phone}@c.us`;
        const timestamp = body.timestamp;
        const messageText = body.messageData.textMessageData?.textMessage || "";

        let chat = chatsRef.current.find((c) => c.maxId === maxId);

        if (!chat) {
          chat = {
            id,
            maxId,
            name: body.senderData.senderName || "Неизвестный",
            type: "remote",
          };
          setChats((prev) => [chat!, ...prev]);
        }

        const incomingMessage: Message = {
          id: Date.now(),
          chatId: id,
          type: "message",
          timestamp,
          status: "received",
          body: messageText,
          isOutgoing: false,
        };

        setMessagesByChat((prev) => ({
          ...prev,
          [id]: [...(prev[id] || []), incomingMessage],
        }));

        setChats(
          updateLastMessage(
            id,
            messageText,
            timestamp,
            body.senderData.senderName || "",
          ),
        );
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const messages = activeChatId ? messagesByChat[activeChatId] || [] : [];

  const chatName = activeChatId
    ? chats.find((c) => c.id === activeChatId)?.name || activeChatId
    : "";

  const handleNewChat = async (phone: string) => {
    const settings = getSettings();
    if (!settings) {
      alert("Сначала настройте API в настройках");
      return;
    }
    const { idInstance, apiTokenInstance } = settings;

    const id = `${phone}@c.us`;

    let maxId: string;
    try {
      const res = await axios.post(
        `https://api.green-api.com/waInstance${idInstance}/checkAccount/${apiTokenInstance}`,
        { phoneNumber: Number(phone) },
      );
      if (!res.data.exist || !res.data.chatId) {
        alert("Получатель не найден");
        return;
      }
      maxId = res.data.chatId;
    } catch {
      alert("Ошибка поиска получателя");
      return;
    }

    const existing = chatsRef.current.find((c) => c.maxId === maxId);
    if (existing) {
      setActiveChatId(existing.id);
      return;
    }

    setChats((prev) => [...prev, { id, maxId, name: phone, type: "remote" }]);
    setActiveChatId(id);
  };

  const handleSend = async (message: string) => {
    if (!activeChatId) return;

    const settings = getSettings();
    if (!settings) {
      alert("Сначала настройте API в настройках");
      return;
    }
    const { idInstance, apiTokenInstance } = settings;

    try {
      await axios.post(
        `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        { chatId: activeChatId, message },
      );

      const timestamp = Math.floor(Date.now() / 1000);
      const newMessage: Message = {
        id: Date.now(),
        chatId: activeChatId,
        type: "message",
        timestamp,
        status: "sent",
        body: message,
        isOutgoing: true,
      };
      setMessagesByChat((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), newMessage],
      }));

      setChats(updateLastMessage(activeChatId, message, timestamp, "Вы"));
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
              chatName={chatName}
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
