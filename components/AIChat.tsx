"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl z-50"
      >
        <MessageCircle size={28} />
      </button>

      {/* Pop-up Chat Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 w-80 bg-white shadow-2xl border rounded-2xl z-50 flex flex-col overflow-hidden"
          style={{
            maxHeight: 'calc(100vh - 120px)', // leave space for header and bottom button
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-t-2xl">
            <h2 className="font-semibold">Library AI Assistant</h2>
            <button onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center mt-10">
                Ask about books, topics or criminology.
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs font-bold">
                      {msg.role === "assistant" ? "AI" : "You"}
                    </span>
                  </div>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button disabled={loading || !input.trim()} type="submit">
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
