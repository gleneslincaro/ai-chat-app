"use client";

import { useEffect, useRef, useState } from "react";
import AiResponse from "./AiResponse";

export default function ChatBox() {
    const [messages, setMessages] = useState<string[]>(
      []
    );
    const [input, setInput] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  
    const sendMessage = async () => {
      if (!input.trim()) return;
      setMessages((prev) => [...prev, `You: ${input}`, "Generating..."]);
      setInput("");
  
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: input }),
      });
  
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
  
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        aiText += decoder.decode(value);
        setMessages((prev) => [...prev.slice(0, -1), aiText]);
      }
    };
  
    return (
      <div className="p-4 max-w-4xl mx-auto bg-gray-900 text-gray-100 min-h-screen flex flex-col pb-[80px]">
        <h1 className="text-2xl font-bold mb-4 text-gray-200">AI Chat</h1>
        <div className="flex-1 space-y-2 mb-4 h-[400px] overflow-y-auto border border-gray-700 p-2 rounded bg-gray-800">
          {messages.map((msg, idx) => (
              <div
              key={idx}
              className={`p-2 rounded ${
                msg.startsWith('You:')
                ? "bg-gray-600 text-white max-w-[80%] ml-auto rounded-2xl p-[15px]"
                : "text-gray-200 p-[15px]"
              }`}
              >
              {msg.startsWith('You:') ? (
                <AiResponse content={msg.replace(/^You: /, '')} />
              ) : (
                <AiResponse content={msg} />
              )}
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border border-gray-700 rounded px-2 py-1 bg-gray-800 text-gray-100 placeholder-gray-500"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }
