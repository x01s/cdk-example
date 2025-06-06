'use client';

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "user", content: "Hello!" },
    { role: "assistant", content: "Hi there! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // Simulate bot reply (replace with actual API call)
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: "This is a mock response." }]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-zinc-900 dark:text-white flex">
      {/* Sidebar for chat history */}
      <aside className="w-64 bg-orange-50 dark:bg-zinc-800 border-r border-orange-200 p-4 hidden sm:block">
        <h2 className="text-xl font-bold mb-4 text-orange-500">Chat History</h2>
        <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="cursor-pointer hover:text-orange-600">Chat with GPT</li>
          <li className="cursor-pointer hover:text-orange-600">Customer Support</li>
        </ul>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col max-h-screen">
        <header className="p-4 border-b border-orange-200 bg-orange-100 dark:bg-zinc-800">
          <h1 className="text-xl font-semibold text-orange-600">Chat with AI</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-xl px-4 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-orange-100 self-end text-right"
                  : "bg-zinc-100 dark:bg-zinc-700 self-start"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          ))}
        </div>

        <footer className="p-4 border-t border-orange-200 bg-white dark:bg-zinc-900">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              className="flex-1 border border-orange-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-800"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
