"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";

export default function ChatPage() {
  const {
    chats,
    activeChat,
    createNewChat,
    setActiveChat,
    loadChatsFromStorage,
  } = useChatStore();

  useEffect(() => {
    loadChatsFromStorage();
  }, [loadChatsFromStorage]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={createNewChat}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatInterface chatId={activeChat.id} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
              <p>Select a chat or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
