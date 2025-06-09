import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// Define PdfReference interface here or ensure it's imported from a shared types file
export interface PdfReference {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  pdfReferences: PdfReference[]; // Added PDF references
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  chats: Chat[];
  activeChat: Chat | null;
  createNewChat: () => void;
  setActiveChat: (chat: Chat) => void;
  addMessage: (
    chatId: string,
    message: Omit<Message, "id" | "timestamp">
  ) => string; // Return the message ID
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  updateChatPdfReferences: (chatId: string, references: PdfReference[]) => void; // New action
  deleteChat: (chatId: string) => void;
  loadChatsFromStorage: () => void;
  saveChatsToStorage: () => void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  chats: [],
  activeChat: null,

  createNewChat: () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      pdfReferences: [], // Initialize PDF references
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state: ChatStore) => ({
      chats: [newChat, ...state.chats],
      activeChat: newChat,
    }));

    get().saveChatsToStorage();
  },

  setActiveChat: (chat: Chat) => {
    set({ activeChat: chat });
  },

  addMessage: (chatId: string, message: Omit<Message, "id" | "timestamp">): string => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    set((state: ChatStore) => ({
      chats: state.chats.map((chat: Chat) => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, newMessage],
            updatedAt: new Date(),
            title:
              chat.messages.length === 0
                ? message.content.slice(0, 50) + "..."
                : chat.title,
          };
          return updatedChat;
        }
        return chat;
      }),
      activeChat:
        state.activeChat?.id === chatId
          ? {
              ...state.activeChat,
              messages: [...state.activeChat.messages, newMessage],
            }
          : state.activeChat,
    }));

    get().saveChatsToStorage();
    return newMessage.id;
  },

  updateMessage: (chatId: string, messageId: string, content: string) => {
    set((state: ChatStore) => ({
      chats: state.chats.map((chat: Chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg: Message) =>
              msg.id === messageId
                ? { ...msg, content, isStreaming: false }
                : msg
            ),
            updatedAt: new Date(),
          };
        }
        return chat;
      }),
      activeChat:
        state.activeChat?.id === chatId
          ? {
              ...state.activeChat,
              messages: state.activeChat.messages.map((msg: Message) =>
                msg.id === messageId
                  ? { ...msg, content, isStreaming: false }
                  : msg
              ),
            }
          : state.activeChat,
    }));

    get().saveChatsToStorage();
  },

  updateChatPdfReferences: (chatId: string, references: PdfReference[]) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, pdfReferences: references, updatedAt: new Date() } : chat
      ),
      activeChat: state.activeChat?.id === chatId ? { ...state.activeChat, pdfReferences: references, updatedAt: new Date() } : state.activeChat,
    }));
    get().saveChatsToStorage();
  },

  deleteChat: (chatId: string) => {
    set((state: ChatStore) => ({
      chats: state.chats.filter((chat: Chat) => chat.id !== chatId),
      activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
    }));

    get().saveChatsToStorage();
  },

  loadChatsFromStorage: () => {
    try {
      const savedChats = localStorage.getItem("chats");
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          pdfReferences: chat.pdfReferences || [], // Initialize if missing
        }));
        set({ chats: parsedChats });
      }
    } catch (error) {
      console.error("Failed to load chats from storage:", error);
    }
  },

  saveChatsToStorage: () => {
    try {
      const { chats } = get();
      localStorage.setItem("chats", JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save chats to storage:", error);
    }
  },
}));
