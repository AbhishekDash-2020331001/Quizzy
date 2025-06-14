"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, File, X, Paperclip, Loader2 } from "lucide-react"; // Added Paperclip and Loader2 icons
import { useChatStore } from "@/hooks/use-chat-store";
import { ChatMessage } from "./chat-message";
import { PdfReferenceModal } from "./pdf-reference-modal";
import { listUploadsAction } from "@/action/uploads.action";
import { UploadType } from "@/lib/types";
import { PdfReference } from "@/hooks/use-chat-store"; // Import PdfReference
import { AI_URL } from "@/lib/data";

interface ChatInterfaceProps {
  chatId: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  // const [pdfReferences, setPdfReferences] = useState<PdfReference[]>([]); // Ensured local state is removed/commented
  const [availablePdfs, setAvailablePdfs] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for ScrollArea component

  const { chats, addMessage, updateMessage, updateChatPdfReferences } =
    useChatStore(); // Added updateChatPdfReferences
  const currentChat = chats.find((chat) => chat.id === chatId);

  useEffect(() => {
    loadAvailablePdfs();
  }, []);

  // Removed useEffect that scrolled on every currentChat.messages change

  useEffect(() => {
    // When switching to a new chat, scroll to the bottom.
    // A small delay can help ensure content is rendered and scroll position is calculated correctly.
    if (messagesEndRef.current) {
      setTimeout(() => forceScrollToBottom(), 50);
    }
  }, [chatId]);

  const loadAvailablePdfs = async () => {
    try {
      const result = await listUploadsAction();
      if (result.success) {
        setAvailablePdfs(result.data);
      }
    } catch (error) {
      console.error("Failed to load PDFs:", error);
    }
  };

  const forceScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const SCROLL_THRESHOLD = 50; // pixels
  const conditionalScrollToBottom = () => {
    const scrollAreaRoot = scrollAreaRef.current;
    if (scrollAreaRoot) {
      // For shadcn/ui ScrollArea, the viewport is a child with a specific data attribute
      const viewport = scrollAreaRoot.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        const { scrollHeight, scrollTop, clientHeight } = viewport;
        // If the user is within SCROLL_THRESHOLD of the bottom, then scroll.
        if (scrollHeight - scrollTop <= clientHeight + SCROLL_THRESHOLD) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Fallback if viewport not found (e.g., structure changed or error in selector)
        // console.warn("Scroll viewport not found, falling back to force scroll for safety.");
        forceScrollToBottom();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    // Handle @ symbol for PDF referencing
    if (e.key === "@") {
      setShowPdfModal(true);
    }
  };

  const handlePdfSelect = (pdf: UploadType) => {
    const reference: PdfReference = {
      id: pdf.pdf_id,
      name: pdf.pdf_name,
    };
    const currentReferences = currentChat?.pdfReferences || [];
    if (!currentReferences.find((ref) => ref.id === reference.id)) {
      updateChatPdfReferences(chatId, [...currentReferences, reference]);
    }
    setShowPdfModal(false);
  };

  const removePdfReference = (id: string) => {
    const currentReferences = currentChat?.pdfReferences || [];
    updateChatPdfReferences(
      chatId,
      currentReferences.filter((ref) => ref.id !== id)
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    // Add user message
    addMessage(chatId, {
      content: userMessage,
      role: "user",
    });
    forceScrollToBottom(); // Scroll when user sends a message

    // Create assistant message placeholder
    const assistantMessageId = addMessage(chatId, {
      content: "",
      role: "assistant",
      isStreaming: true,
    });

    try {
      // Prepare conversation history
      const conversationHistory =
        currentChat?.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || [];

      // Prepare request data
      const requestData = {
        pdf_ids: currentChat?.pdfReferences?.map((ref) => ref.id) || [],
        message: userMessage,
        conversation_history: conversationHistory.slice(0, -2),
      };

      // Make streaming request
      const response = await fetch(`${AI_URL}/pdf/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        console.error("Response not OK:", response.status, response.statusText);
        throw new Error("Failed to get response");
      }

      console.log("Response OK, starting to read stream...");

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let fullResponse = "";
      let currentStatus = "";
      let sources: string[] = [];
      let isGeneratingResponse = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream finished");
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsedData = JSON.parse(line.slice(6));
              console.log("Parsed streaming data:", parsedData);

              if (parsedData.type === "status") {
                currentStatus = parsedData.data;
                console.log("Status update:", currentStatus);

                if (!isGeneratingResponse) {
                  console.log(
                    "Updating message with status:",
                    `*${currentStatus}*`
                  );
                  updateMessage(
                    chatId,
                    assistantMessageId,
                    `*${currentStatus}*`
                  );
                  conditionalScrollToBottom(); // Conditional scroll during streaming status updates
                }
              } else if (parsedData.type === "sources") {
                sources = parsedData.data;
                console.log("Sources received:", sources);

                const sourceText =
                  sources.length > 0
                    ? `**Sources:** ${sources.join(", ")}\n\n`
                    : "";
                console.log("Updating message with sources:", sourceText);
                updateMessage(chatId, assistantMessageId, sourceText);
                conditionalScrollToBottom(); // Conditional scroll during streaming source updates
              } else if (parsedData.type === "content") {
                isGeneratingResponse = true;
                fullResponse += parsedData.data;

                let displayMessage = "";
                if (sources.length > 0) {
                  displayMessage += `**Sources:** ${sources.join(", ")}\n\n`;
                }
                displayMessage += fullResponse;

                console.log(
                  "Content chunk received. Full response so far:",
                  fullResponse
                );
                console.log(
                  "Updating message with:",
                  displayMessage.substring(0, 100) + "..."
                );

                updateMessage(chatId, assistantMessageId, displayMessage);
              } else if (parsedData.type === "done") {
                console.log("Stream done, finalizing message");

                let finalMessage = "";
                if (sources.length > 0) {
                  finalMessage += `**Sources:** ${sources.join(", ")}\n\n`;
                }
                finalMessage += fullResponse;

                console.log("Final message:", finalMessage);
                updateMessage(chatId, assistantMessageId, finalMessage);
                break;
              }
            } catch (e) {
              console.warn("Failed to parse streaming data:", line, e);
            }
          }
        }
      }

      console.log("Stream processing complete");
    } catch (error) {
      console.error("Chat error:", error);
      updateMessage(
        chatId,
        assistantMessageId,
        "Sorry, I encountered an error. Please try again."
      );
    } finally {
      console.log("Setting loading to false");
      setIsLoading(false);
      // Removed setPdfReferences([]) as it's store-managed
    }
  }; // This is the correct end of handleSendMessage

  return (
    <div className="flex flex-col flex-1 bg-gray-50 overflow-hidden p-4 gap-3">
      {" "}
      {/* Changed h-full to h-screen and added bg color */}
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
        {/* Chat Title Row */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg text-gray-800">
            {currentChat?.title || "Chat"}
          </h2>
          {/* You can add other elements here if they should be aligned with the title */}
        </div>

        {/* PDF References Section */}
        {currentChat?.pdfReferences && currentChat.pdfReferences.length > 0 && (
          <div className="mb-1">
            <h3 className="text-xs font-medium text-gray-500 mb-1">
              Active PDF References:
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {currentChat.pdfReferences.map((ref) => (
                <Badge
                  key={ref.id}
                  variant="outline"
                  className="flex items-center gap-1.5 py-1 px-2 border-blue-500 text-blue-700 bg-blue-50"
                >
                  <File className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{ref.name}</span>
                  <button
                    onClick={() => removePdfReference(ref.id)}
                    className="ml-1 p-0.5 rounded-full hover:bg-blue-200"
                    aria-label={`Remove ${ref.name} reference`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Messages */}
      <ScrollArea
        className="flex-1 p-4 bg-gray-100 min-h-0 rounded-md"
        ref={scrollAreaRef}
      >
        {" "}
        {/* Added bg color to message area */}
        <div className="space-y-4">
          {currentChat?.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 bg-white sticky bottom-0 z-10 shadow-t">
        {" "}
        {/* Adjusted padding, sticky, shadow */}
        <div className="flex items-end gap-2">
          {" "}
          {/* items-end for better alignment with multi-line textarea */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPdfModal(true)}
            className="flex-shrink-0 border-gray-300 hover:bg-gray-100"
            aria-label="Attach PDF"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Use @ or click paperclip to reference PDFs)"
            className="flex-1 resize-none border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] max-h-[120px] text-sm p-2"
            rows={1} // Start with 1 row, auto-expands with content
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "inherit";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-md w-10 h-10"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      {/* PDF Reference Modal */}
      <PdfReferenceModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        pdfs={availablePdfs}
        onSelect={handlePdfSelect}
      />
    </div>
  );
}
