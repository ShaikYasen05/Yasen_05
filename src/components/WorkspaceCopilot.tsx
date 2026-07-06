import React, { useState, useRef, useEffect } from "react";
import { Compass, Send, X, MessageSquare, RefreshCw, AlertTriangle, ListTodo, Clipboard, Zap } from "lucide-react";
import { api } from "../services/api";

interface Message {
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
}

interface WorkspaceCopilotProps {
  onTaskCreated?: () => void;
  activeProjectId?: string;
  activeTaskId?: string;
}

export default function WorkspaceCopilot({ onTaskCreated, activeProjectId, activeTaskId }: WorkspaceCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "copilot",
      text: "Hello! Welcome to your interactive workspace copilot. I am connected to your active project boards and documents. Feel free to ask me to draft detailed technical specifications, analyze team resource allocation, or summarize pending milestones.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    if (!textToSend) setInput("");
    setMessages(prev => [...prev, { sender: "user", text: prompt, timestamp: new Date() }]);
    setLoading(true);

    try {
      const result = await api.aiChat(prompt, activeProjectId, activeTaskId);
      setMessages(prev => [...prev, { sender: "copilot", text: result.text || "No response received.", timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev, 
        { 
          sender: "copilot", 
          text: `⚠️ **Workspace Service Offline**: ${err.message || "Failed to contact local backend server. Please verify connections."}`, 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const executePreset = (prompt: string) => {
    handleSend(prompt);
  };

  // Convert simple markdown inside response to readable HTML elements
  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let content = line;
      // Headers
      if (content.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-bold mt-3 mb-1 text-slate-800 font-display">{content.substring(4)}</h4>;
      }
      if (content.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-bold mt-4 mb-2 text-slate-800 font-display border-b border-slate-200 pb-1">{content.substring(3)}</h3>;
      }
      if (content.startsWith("# ")) {
        return <h2 key={idx} className="text-lg font-bold mt-4 mb-2 text-slate-800 font-display border-b border-slate-200 pb-1">{content.substring(2)}</h2>;
      }
      // List items
      if (content.trim().startsWith("- ") || content.trim().startsWith("* ")) {
        return <li key={idx} className="ml-4 list-disc text-slate-600 text-xs my-1">{content.trim().substring(2)}</li>;
      }
      // Bullet points with checked checkboxes
      if (content.trim().startsWith("- [ ]") || content.trim().startsWith("- [x]")) {
        const isChecked = content.includes("[x]");
        return (
          <div key={idx} className="flex items-center gap-2 my-1 ml-4 text-xs text-slate-600">
            <input type="checkbox" checked={isChecked} readOnly className="rounded border-slate-300 bg-white text-blue-600 focus:ring-0" />
            <span>{content.substring(content.indexOf("]") + 1).trim()}</span>
          </div>
        );
      }
      // Bold items
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(content)) {
        const parts = content.split(boldRegex);
        return (
          <p key={idx} className="text-xs text-slate-600 my-1 leading-relaxed">
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-800 font-medium">{part}</strong> : part)}
          </p>
        );
      }
      
      return <p key={idx} className="text-xs text-slate-600 my-1 leading-relaxed">{content}</p>;
    });
  };

  return (
    <>
      {/* Floating Copilot Trigger Button */}
      <button
        id="copilot-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg border border-slate-700 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
      >
        <Compass className="w-5 h-5 text-slate-300 group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-medium tracking-wide font-display">Workspace Copilot</span>
        {messages.length > 1 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white animate-bounce" />
        )}
      </button>

      {/* Floating Chat Container */}
      {isOpen && (
        <div
          id="copilot-chat-panel"
          className="fixed bottom-24 right-6 z-50 w-[420px] h-[600px] max-w-[calc(100vw-32px)] bg-white text-slate-700 rounded-2xl shadow-2xl flex flex-col border border-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 font-display flex items-center gap-1.5">
                  Workspace Copilot
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Workspace Context Companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "copilot" && (
                  <div className="w-7 h-7 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs border ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-white border-slate-700"
                      : "bg-slate-50 text-slate-700 border-slate-100"
                  }`}
                >
                  {msg.sender === "copilot" ? (
                    <div className="space-y-1">{formatMarkdown(msg.text)}</div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  )}
                  <span className="block text-[9px] text-slate-400 text-right mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs flex items-center gap-2 text-slate-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                  <span>Analyzing workspace context...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Context Presets */}
          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 space-y-1.5 shrink-0">
            <span className="text-[10px] text-slate-500 font-semibold px-1 flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-500" /> Common Assistant Queries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => executePreset("Analyze workspace risks, overdue deadlines, and suggest improvements.")}
                className="flex items-center gap-1 text-[10px] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-2.5 h-2.5 text-orange-400" /> Workspace Health Audit
              </button>
              <button
                onClick={() => executePreset("Draft a detailed markdown task description for designing a premium dashboard user interface.")}
                className="flex items-center gap-1 text-[10px] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <Clipboard className="w-2.5 h-2.5 text-blue-400" /> Draft Task Description
              </button>
              <button
                onClick={() => executePreset("Evaluate the workload balancing across teams. Are any engineers overloaded?")}
                className="flex items-center gap-1 text-[10px] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <ListTodo className="w-2.5 h-2.5 text-green-400" /> Workload Distribution
              </button>
            </div>
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about project risks, specs, deadlines..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl transition-all duration-200 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
