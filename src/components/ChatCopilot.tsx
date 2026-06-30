import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Bot, User, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidateIds: string[];
  jobDescription: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export function ChatCopilot({ isOpen, onClose, selectedCandidateIds, jobDescription }: ChatCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      sender: "ai",
      text: "Hello! I am your AI Recruitment Co-Pilot. I have direct access to your candidate database and current search weights. Feel free to ask me to analyze fits, compare profiles, check notice periods, or write interview questions for specific matches!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          candidateIds: selectedCandidateIds,
          jobDescription,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.message || "Failed to fetch response.");
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: `Error: ${err.message || "Something went wrong while connecting to the AI co-pilot server. Please verify your GEMINI_API_KEY in the Secrets panel."}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "initial-reset",
        sender: "ai",
        text: "Chat cleared! How can I assist you in discovering and evaluating talent today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="chat-copilot-container" className="fixed right-4 bottom-24 z-40 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-150 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-slate-800 rounded-lg">
                <Bot size={16} />
              </div>
              <div>
                <span className="block text-xs font-bold font-display tracking-wide">Recruitment Co-Pilot</span>
                {selectedCandidateIds.length > 0 && (
                  <span className="text-[10px] text-slate-300 font-medium">Context: {selectedCandidateIds.length} candidate(s) pinned</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={clearChat}
                className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                  <div className={`p-1.5 rounded-full shrink-0 ${msg.sender === "user" ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-750"}`}>
                    {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                    msg.sender === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white text-slate-700 border border-slate-200 shadow-xs rounded-tl-none"
                  }`}>
                    {messages.length > 0 && msg.text.split("\n").map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <div className="p-1.5 rounded-full shrink-0 bg-slate-100 text-slate-700">
                    <Bot size={12} />
                  </div>
                  <div className="p-3 bg-white text-slate-400 border border-slate-200 shadow-xs rounded-2xl rounded-tl-none text-xs flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-150 flex items-center space-x-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about candidate, notice periods, compensation..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-800 transition-colors"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className={`p-2.5 rounded-xl text-white transition-all ${
                !input.trim() || isSending
                  ? "bg-slate-200 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-black shadow-xs"
              }`}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </AnimatePresence>
  );
}
