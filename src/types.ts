export type View = "chats" | "settings";

export interface Chat {
  id: string;
  maxId: string;
  waChatId: string;
  name: string;
  type: "remote" | "group" | "broadcast";
  lastMessage?: {
    body: string;
    timestamp: number;
    senderName: string;
  };
}

export interface Message {
  id: number;
  chatId: string;
  type: "message" | "notification";
  timestamp: number;
  status: string;
  body: string;
  isOutgoing: boolean;
}
