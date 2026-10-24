export interface Message {
  id: number;
  chatId: string;
  type: "message" | "notification";
  timestamp: number;
  status: string;
  body: string;
  isOutgoing: boolean;
}

export interface Chat {
  id: string;
  name: string;
  type: "remote" | "group" | "broadcast";
  lastMessage?: {
    body: string;
    timestamp: number;
    senderName: string;
  };
}

export type View = "chats" | "settings";

export interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export interface ChatWindowProps {
  chatName: string;
  messages: Message[];
  onSend: (message: string) => void;
}

export interface MessageBubbleProps {
  text: string;
  timestamp: number;
  isOutgoing: boolean;
}

export interface NavigationProps {
  activeView: View;
  onChangeView: (view: View) => void;
}

export interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (phone: string) => void;
}

export interface SettingsSidebarProps {
  activeSetting: string;
  onSelect: (setting: string) => void;
}

export interface ApiSettingsProps {
  activeSetting: string;
}
