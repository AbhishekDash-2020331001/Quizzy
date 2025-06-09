"use client";

import { Message } from "@/hooks/use-chat-store";
import { Card } from "@/components/ui/card";
import { User, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex ${isAssistant ? "justify-start" : "justify-end"} mb-4`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${
          isAssistant ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAssistant ? "bg-blue-100" : "bg-gray-100"
          }`}
        >
          {isAssistant ? (
            <Bot className="w-4 h-4 text-blue-600" />
          ) : (
            <User className="w-4 h-4 text-gray-600" />
          )}
        </div>

        {/* Message Content */}
        <Card
          className={`p-3 ${
            isAssistant
              ? "bg-white border-gray-200"
              : "bg-blue-600 text-white border-blue-600"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {isAssistant ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
            {message.isStreaming && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
            )}
          </div>

          {/* Timestamp */}
          <div
            className={`text-xs mt-2 ${
              isAssistant ? "text-gray-500" : "text-blue-100"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </Card>
      </div>
    </div>
  );
}
