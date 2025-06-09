"use client";

import { Chat } from "@/hooks/use-chat-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, MessageSquare } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export function ChatSidebar({
  chats,
  activeChat,
  onSelectChat,
}: ChatSidebarProps) {
  const { deleteChat } = useChatStore();

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      deleteChat(chatId);
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chats yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group cursor-pointer rounded-lg p-3 border transition-colors ${
                activeChat?.id === chat.id
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {chat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {chat.messages.length} messages
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                >
                  <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
