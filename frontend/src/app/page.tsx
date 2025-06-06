'use client';

import { useEffect, useRef, useState } from 'react';

const WSS_URL = 'wss://your-api-id.execute-api.your-region.amazonaws.com/staging';
const THREAD_ID = 'thread-001';
const SENDER_ID = 'user-001';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new WebSocket(WSS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Connected');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'chat') {
          setMessages((prev) => [
            ...prev,
            {
              role: message.payload.senderId === SENDER_ID ? 'user' : 'assistant',
              content: message.payload.text,
            },
          ]);
        }
      } catch (_) {
        console.error('[WebSocket] Failed to parse message:', event.data);
      }
    };

    socket.onclose = () => {
      console.log('[WebSocket] Disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const messagePayload = {
      type: 'chat',
      payload: {
        threadId: THREAD_ID,
        senderId: SENDER_ID,
        text: input.trim(),
      },
    };

    socketRef.current?.send(JSON.stringify(messagePayload));

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-zinc-900 flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg sm:hidden"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed sm:static inset-y-0 left-0 z-40 w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 transition-transform duration-300 ease-in-out bg-gradient-to-b from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-violet-950 p-5 shadow-xl`}>
        <div className="flex items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Conversations</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto p-2 text-white rounded-full hover:bg-white/10 sm:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Chat
          </button>
        </div>

        <ul className="mt-4 space-y-1">
          <li className="cursor-pointer hover:bg-white/10 rounded-lg p-3 text-white/90 hover:text-white transition flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat with GPT
          </li>
        </ul>
      </aside>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col max-h-screen">
        <header className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 text-transparent bg-clip-text">Chat with AI</h1>
            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Start a conversation</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">Ask questions, get answers, or just chat. Your AI assistant is ready to help.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-3xl mx-auto flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xl px-5 py-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
          <form
            className="max-w-3xl mx-auto flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full rounded-full pl-4 pr-12 py-3 border-2 border-gray-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-600 bg-white dark:bg-slate-800 shadow-sm"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md hover:from-indigo-600 hover:to-violet-700 transition-all"
                disabled={!input.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </footer>
      </main>
    </div>
  );
}
