import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Plus, Trash2, MessageSquare, X, Loader2, ChevronRight, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { api, formatIsoTime } from "@/lib/api";

const STOCK_CHIPS = [
  { label: "AAPL", sector: "Mega Cap" },
  { label: "NVDA", sector: "Mega Cap" },
  { label: "TSLA", sector: "Growth" },
  { label: "SPY", sector: "ETF" },
  { label: "QQQ", sector: "ETF" },
  { label: "BTC-USD", sector: "Crypto" },
  { label: "ETH-USD", sector: "Crypto" },
];

const SUGGESTED_PROMPTS = [
  "What should I check before investing in a stock?",
  "Compare AAPL and NVDA from a fundamentals perspective.",
  "Explain how to read a daily K-line chart.",
  "What are the main risk signals in a balance sheet?",
];

function parseAssistantContent(content) {
  const chartMatch = content.match(/```json-chart\s*([\s\S]*?)```/);
  let chart = null;
  let markdown = content;

  if (chartMatch) {
    try {
      chart = JSON.parse(chartMatch[1]);
      markdown = content.replace(chartMatch[0], "").trim();
    } catch (error) {
      chart = null;
    }
  }

  return { markdown, chart };
}

function JsonChart({ chart }) {
  if (!chart?.labels?.length || !chart?.data?.length) return null;

  const data = chart.labels.map((label, index) => ({
    label,
    value: Number(chart.data[index] || 0),
  }));

  return (
    <div className="mt-3 border border-border rounded-xl p-3 bg-background">
      {chart.title && <p className="text-xs font-medium text-foreground mb-3">{chart.title}</p>}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(0,0%,91%)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--navy))" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(0,0%,91%)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--navy))" strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const { markdown, chart } = isUser
    ? { markdown: message.content, chart: null }
    : parseAssistantContent(message.content);

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-gold font-serif text-xs font-bold">U</span>
        </div>
      )}

      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {!isUser && Array.isArray(message.tools_used) && message.tools_used.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {message.tools_used.map((tool, index) => (
              <span
                key={`${tool.tool || tool.name || tool}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-xs text-muted-foreground"
              >
                <Zap className="w-2.5 h-2.5" />
                {tool.tool || tool.name || String(tool)}
              </span>
            ))}
          </div>
        )}

        <div className={`rounded-2xl px-4 py-3 ${isUser ? "bg-navy text-white" : "bg-card border border-border"}`}>
          {markdown && (
            isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{markdown}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm max-w-none
                  [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:my-1
                  [&_ul]:my-2 [&_ul]:pl-4 [&_li]:my-0.5 [&_li]:text-foreground
                  [&_ol]:my-2 [&_ol]:pl-4
                  [&_strong]:text-foreground [&_strong]:font-semibold
                  [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
                  [&_h1]:text-lg [&_h1]:font-serif [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold
                  [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground"
                components={{
                  a: ({ children, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-navy underline">
                      {children}
                    </a>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            )
          )}

          {!isUser && chart && <JsonChart chart={chart} />}
        </div>

        <p className="text-xs text-muted-foreground px-1">{formatIsoTime(message.timestamp)}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
        <span className="text-gold font-serif text-xs font-bold">U</span>
      </div>
      <div className="bg-card border border-border rounded-2xl px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: index * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const loadSessions = async (preferredSessionId = null) => {
    const response = await api.getAgentSessions();
    const nextSessions = response.sessions || [];
    setSessions(nextSessions);

    if (preferredSessionId) {
      setActiveSession(preferredSessionId);
      return;
    }

    setActiveSession((current) => {
      if (current && nextSessions.some((session) => session.id === current)) {
        return current;
      }

      return nextSessions[0]?.id || null;
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        setLoadingSessions(true);
        setError("");
        await loadSessions();
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load U2CHAT sessions.");
        }
      } finally {
        if (!cancelled) {
          setLoadingSessions(false);
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      try {
        setLoadingHistory(true);
        const response = await api.getAgentHistory(activeSession);
        if (!cancelled) {
          setMessages(response.history || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load chat history.");
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const newSession = () => {
    setActiveSession(null);
    setMessages([]);
    setSelectedStocks([]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const clearSession = async () => {
    try {
      if (activeSession) {
        await api.clearAgentSession(activeSession);
        await loadSessions();
      }
      setActiveSession(null);
      setMessages([]);
    } catch (err) {
      setError(err.message || "Failed to clear the session.");
    }
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || loading) return;

    const contextSuffix = selectedStocks.length > 0 ? `\n\nFocus stocks: ${selectedStocks.join(", ")}` : "";
    const outboundMessage = `${content}${contextSuffix}`;
    const userMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);

    try {
      const response = await api.sendAgentMessage(outboundMessage, activeSession);

      const assistantMessage = {
        role: "assistant",
        content: response.response || "No response returned.",
        timestamp: new Date().toISOString(),
        tools_used: response.tools_used || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await loadSessions(response.session_id || activeSession);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "The stock agent failed to answer this request.",
          timestamp: new Date().toISOString(),
          tools_used: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const currentSession = useMemo(
    () => sessions.find((session) => session.id === activeSession) || null,
    [activeSession, sessions]
  );

  if (loadingSessions) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-sm">Loading U2CHAT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-56 border-r border-border bg-muted/30 flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-4 border-b border-border">
          <button
            onClick={newSession}
            className="w-full flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-xs text-muted-foreground px-3 py-2">No history yet</div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors truncate ${
                  session.id === activeSession
                    ? "bg-card border border-border text-foreground font-medium"
                    : "text-muted-foreground hover:bg-card"
                }`}
              >
                <MessageSquare className="w-3 h-3 inline mr-1.5 mb-0.5" />
                {session.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-background flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-semibold text-foreground text-sm">U2CHAT</h1>
            <p className="text-xs text-muted-foreground">
              Session-based stock agent backed by market tools and the local knowledge base
            </p>
          </div>
          <button
            onClick={clearSession}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="px-5 py-2.5 border-b border-border bg-background/50 flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Add context:</span>
          <div className="flex gap-1.5 flex-wrap">
            {STOCK_CHIPS.map((chip) => {
              const active = selectedStocks.includes(chip.label);
              return (
                <button
                  key={chip.label}
                  onClick={() =>
                    setSelectedStocks((prev) =>
                      active ? prev.filter((stock) => stock !== chip.label) : [...prev, chip.label]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                    active
                      ? "bg-navy text-white border-navy"
                      : "bg-card border-border text-muted-foreground hover:border-navy/30"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
            {selectedStocks.length > 0 && (
              <button
                onClick={() => setSelectedStocks([])}
                className="px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {(messages.length === 0 && !loadingHistory) && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center mb-4">
                <span className="text-gold font-serif text-lg font-bold">U</span>
              </div>
              <h2 className="font-serif text-xl text-foreground mb-2">
                {currentSession ? currentSession.title : "U2CHAT"}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Ask about US stocks, ETFs, crypto, fundamentals, or price history.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="text-left px-4 py-3 bg-card border border-border rounded-xl text-xs text-muted-foreground hover:text-foreground hover:border-navy/20 transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loadingHistory && (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading session history...
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={`${message.timestamp || index}-${index}`} message={message} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-navy/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  autoResize();
                }}
                onKeyDown={handleKey}
                placeholder="Ask about investing, quotes, market news, or any financial concept..."
                rows={1}
                className="w-full text-sm bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground max-h-[180px]"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center hover:bg-navy/90 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            U2CHAT is for educational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
